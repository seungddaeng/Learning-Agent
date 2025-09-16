import { Button, Space, Typography, theme } from "antd";
import { FileTextOutlined, CloseOutlined } from "@ant-design/icons";
import CustomModal from "../reinforcement/CustomModal";

const { Title, Text } = Typography;

interface InterviewFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export default function InterviewFeedbackModal({
  open,
  onClose,
  onDownload,
}: InterviewFeedbackModalProps) {
  const { token } = theme.useToken();

  return (
    <CustomModal
      visible={open}
      onClose={onClose}
      status="default"
      width={580}
      padding={40}
    >
      <CustomModal.Header
        icon={<FileTextOutlined />}
        title="Entrevista finalizada"
      />
      <CustomModal.Description>
        Tu entrevista ha concluido. Puedes descargar tu feedback o cancelar para volver.
      </CustomModal.Description>
      <CustomModal.Body>
        <Space
          direction="vertical"
          size="large"
          style={{
            width: "100%",
            textAlign: "center",
            paddingInline: token.paddingLG,
          }}
        >
          <Text
            style={{
              color: token.colorTextSecondary,
              fontSize: 16,
              display: "block",
              marginBottom: token.marginSM,
            }}
          >
            Selecciona una opción para continuar
          </Text>
          <Space
            size="large"
            style={{
              justifyContent: "center",
              width: "100%",
              flexWrap: "wrap",
              gap: token.marginMD,
            }}
          >
            <Button
              size="large"
              icon={<CloseOutlined />}
              style={{
                background: token.colorBgContainer,
                color: token.colorText,
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                fontWeight: 500,
                minWidth: 150,
                height: 48,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = token.colorFillTertiary)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = token.colorBgContainer)
              }
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              size="large"
              icon={<FileTextOutlined />}
              style={{
                background: token.colorPrimary,
                color: token.colorTextLightSolid,
                border: "none",
                borderRadius: token.borderRadius,
                fontWeight: 600,
                minWidth: 200,
                height: 48,
                boxShadow: `0 4px 12px ${token.colorPrimary}40`,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = `0 6px 16px ${token.colorPrimary}60`)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow = `0 4px 12px ${token.colorPrimary}40`)
              }
              onClick={onDownload}
            >
              Descargar feedback
            </Button>
          </Space>
        </Space>
      </CustomModal.Body>
    </CustomModal>
  );
}
