import type { CSSProperties } from 'react'
import '../../../components/exams/ExamForm.css';
import '../../../components/shared/Toast.css';
import { ExamForm } from '../../../components/exams/ExamForm';
import { Toast} from '../../../components/shared/Toast';
import PageTemplate from '../../../components/PageTemplate';
import GlobalScrollbar from '../../../components/GlobalScrollbar';
import './ExamCreatePage.css';
import { generateQuestions, createExamApproved, updateExamApprovedFull,type GeneratedQuestion } from '../../../services/exams.service';
import AiResults from '../../exams/ai-results/AiResults';
import { normalizeToQuestions, cloneQuestion, replaceQuestion, reorderQuestions } from '../../exams/ai-utils';
import { isValidGeneratedQuestion } from '../../../utils/aiValidation';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useExamsStore } from '../../../store/examsStore';
import type { ExamSummary } from '../../../store/examsStore';

import AiResults from '../../exams/AiResults';
import { useExamCreate } from './create/useExamCreate';


const layoutStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};
export default function ExamsCreatePage() {
  const {
    formRef,
    aiOpen,
    aiLoading,
    aiError,
    aiQuestions,
    aiMeta,
    toasts,
    handleAIPropose,
    onChangeQuestion,
    onReorderQuestion,
    onRegenerateAll,
    onRegenerateOne,
    onAddManual,
    onSave,
    removeToast,
    showToast,
    editData,
  } = useExamCreate();
  return (
    <PageTemplate
      title="Exámenes"
      subtitle="Creación de exámenes"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Gestión de Exámenes', href: '/exams' },
        { label: 'Crear examen' },
      ]}
    >
      <GlobalScrollbar />
      <div>
        <section
          className="card subtle readable-card"
          style={{ display: aiOpen ? 'none' : 'block' }}
        >
          <div style={layoutStyle}>
            <ExamForm
              ref={formRef}
              onToast={showToast}
              onGenerateAI={handleAIPropose}
              initialData={editData}
            />
          </div>
        </section>

        {aiOpen && (
          <section className="card subtle readable-card">
            <AiResults
              subject={aiMeta.subject}
              difficulty={aiMeta.difficulty}
              createdAt={new Date().toLocaleDateString('es-ES')}
              questions={aiQuestions}
              loading={aiLoading}
              error={aiError}
              onChange={onChangeQuestion}
              onRegenerateAll={onRegenerateAll}
              onRegenerateOne={onRegenerateOne}
              onAddManual={onAddManual}
              onSave={onSave}
              onReorder={onReorderQuestion}
            />
          </section>
        )}

        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </PageTemplate>
  );
}