import React from "react";
import { Modal, Button, Typography, Space } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import {usePdfGenerator} from "../../hooks/usePdfGenerator";
import type { InterviewQuestion } from "../../interfaces/interviewInt";

const { Title, Text } = Typography;

interface InterviewFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onDownload: () => void;
  multipleSelectionData: InterviewQuestion[]; // Datos de preguntas múltiples
  doubleOptionData: InterviewQuestion[];
}

const InterviewFeedbackModal: React.FC<InterviewFeedbackModalProps> = ({
  open,
  onClose,
  multipleSelectionData,
  doubleOptionData,
}) => {
  const { generatePDF } = usePdfGenerator();

  const handleDownload = async () => {
    try {
      const allData = [...multipleSelectionData, ...doubleOptionData];
      await generatePDF(allData);
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
    }
  };
  return (
    <Modal open={open} onCancel={onClose} footer={null} centered>
      <Space direction="vertical" style={{ width: "100%", textAlign: "center" }} size="large">
        <Title level={3} style={{ marginBottom: 0 }}>
          Entrevista finalizada
        </Title>
        <Text>Tu entrevista ha concluido. Puedes descargar tu feedback.</Text>
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
          Descargar feedback
        </Button>
      </Space>
    </Modal>
  );
};

export default InterviewFeedbackModal;
