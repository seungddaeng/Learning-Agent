import { useState } from "react";
import { Button, Modal } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageTemplate from '../../components/PageTemplate';
import useInterviewFlow from '../../hooks/usInterviewFlow';
import OpenQuestion from '../../components/interview/OpenQuestion';
import TeoricQuestion from '../../components/interview/TeoricQuestion';
import MultipleQuestion from '../../components/interview/MultipleQuestion';
import { useThemeStore } from '../../store/themeStore';
import InterviewFeedbackModal from '../../components/interview/InterviewFeedbackModal';
import type { DoubleOptionResponse, MultipleSelectionResponse } from '../../interfaces/interviewInt';
import { usePdfGenerator } from '../../hooks/usePdfGenerator';
import InterviewModal from "../../components/interview/InterviewModal";
import { useStudentInterview } from "../../hooks/useStudentInterview";

const InterviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { currentType, isModalOpen, next, finish, confirmFinish, setIsModalOpen } = useInterviewFlow(['open', 'teoric', 'multiple', 'open']);
   const [selectedValues, setSelectedValues] = useState<DoubleOptionResponse[]>([]);
   const [mulSelectedValues, setMulSelectedValues] = useState<MultipleSelectionResponse[]>([]);
  const {
    isInterviewModalOpen,
    closeInterviewModal,
    startExam,
    questionType,
    currentQuestion,
    questionCount,
    nextQuestion,
  } = useStudentInterview();

  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const { generatePDF } = usePdfGenerator();

  const handleFinish = () => {
    setIsFinishModalOpen(true);
  };

  const handleConfirmFinish = () => {
    setIsFinishModalOpen(false);
    setShowFeedback(true);
  };

  const handleDownloadFeedback = async () => {
    try {
      console.log("Descargando feedback...");
      // Combinar ambos tipos de datos
      const allData = [...mulSelectedValues, ...selectedValues];
      await generatePDF(allData);
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
    }
  };

  const renderQuestion = () => {
    switch (questionType) {
      case "multiple":
        return <MultipleQuestion onNext={nextQuestion} selectedValues={selectedValues} setSelectedValues={setSelectedValues}  />;
      case "truefalse":
        return <TeoricQuestion onNext={nextQuestion}selectedValues={mulSelectedValues} setSelectedValues={setMulSelectedValues}/>;
      default:
        return <OpenQuestion onNext={nextQuestion} />;
    }
  };

  return (
    <>
      <PageTemplate
        breadcrumbs={[
          { label: "Reforzamiento", href: "/reinforcement" },
          { label: "Entrevista" },
        ]}
        title={
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>Entrevista</span>
            {questionCount > 0 && (
              <span
                style={{
                  fontSize: 14,
                  color:
                    theme === "dark"
                      ? "rgba(255,255,255,0.65)"
                      : "rgba(0,0,0,0.65)",
                  fontWeight: 500,
                  marginTop: 4,
                }}
              >
                Pregunta {currentQuestion} de {questionCount}
              </span>
            )}
          </div>
        }
        actions={
          questionCount > 0 && (
            <Button
              icon={<CloseOutlined />}
              onClick={handleFinish}
              type="primary"
              className={
                theme === "dark"
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-primary text-white hover:bg-primary/90"
              }
            >
              Finalizar
            </Button>
          )
        }
      >
        {questionCount > 0 && renderQuestion()}
      </PageTemplate>

      <InterviewModal
        open={isInterviewModalOpen}
        onClose={closeInterviewModal}
        onSelectDifficulty={startExam}
      />

      <Modal
        title="Finalizar Entrevista"
        open={isFinishModalOpen}
        onOk={handleConfirmFinish}
        onCancel={() => setIsFinishModalOpen(false)}
        okText="Sí, finalizar"
        cancelText="No, continuar"
      >
        <p>¿Estás seguro de que quieres finalizar la entrevista?</p>
        <p>Perderás el progreso actual.</p>
      </Modal>

      <InterviewFeedbackModal
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
        onDownload={handleDownloadFeedback}
        multipleSelectionData={mulSelectedValues} // Tus preguntas teóricas
        doubleOptionData={selectedValues}
      />
    </>
  );
};

export default InterviewPage;
