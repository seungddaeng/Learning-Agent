import React, { useState } from 'react';
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

const InterviewChat: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { currentType, isModalOpen, next, finish, confirmFinish, setIsModalOpen } = useInterviewFlow(['open', 'teoric', 'multiple', 'open']);
   const [selectedValues, setSelectedValues] = useState<DoubleOptionResponse[]>([]);
   const [mulSelectedValues, setMulSelectedValues] = useState<MultipleSelectionResponse[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const { generatePDF } = usePdfGenerator();

  const handleConfirmFinish = () => {
    if (confirmFinish()) {
      setIsModalOpen(false);
      setShowFeedback(true);
    }
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
    switch (currentType) {
      case 'open':
        return <OpenQuestion onNext={next} />;
      case 'teoric':
        return <TeoricQuestion onNext={next} selectedValues={mulSelectedValues} setSelectedValues={setMulSelectedValues}/>;
      case 'multiple':
        return <MultipleQuestion onNext={next} selectedValues={selectedValues} setSelectedValues={setSelectedValues} />;
      default:
        return null;
    }
  };

  return (
    <>
      <PageTemplate
        breadcrumbs={[
          { label: 'Reforzamiento', href: '/reinforcement' },
          { label: 'Entrevista' }
        ]}
        title="Entrevista"
        actions={
          <Button
            icon={<CloseOutlined />}
            onClick={finish}
            type="primary"
            className={theme === 'dark' ? 'bg-primary text-white hover:bg-primary/90' : 'bg-primary text-white hover:bg-primary/90'}
          >
            Finalizar
          </Button>
        }
      >
        {renderQuestion()}
      </PageTemplate>

      <Modal
        title="Finalizar Entrevista"
        open={isModalOpen}
        onOk={handleConfirmFinish}
        onCancel={() => setIsModalOpen(false)}
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

export default InterviewChat;
