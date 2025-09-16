import React from "react";
import { Modal, Button, Typography, Space } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface InterviewFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onDownload: () => void;
}

const InterviewFeedbackModal: React.FC<InterviewFeedbackModalProps> = ({
  open,
  onClose,
  onDownload,
}) => {
  return (
    <Modal open={open} onCancel={onClose} footer={null} centered>
      <Space direction="vertical" style={{ width: "100%", textAlign: "center" }} size="large">
        <Title level={3} style={{ marginBottom: 0 }}>
          Entrevista finalizada
        </Title>
        <Text>Tu entrevista ha concluido. Puedes descargar tu feedback.</Text>
        <Button type="primary" icon={<DownloadOutlined />} onClick={onDownload}>
          Descargar feedback
        </Button>
      </Space>
    </Modal>
  );
};

export default InterviewFeedbackModal;
