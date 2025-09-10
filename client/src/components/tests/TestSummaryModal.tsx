import React from "react";
import { Modal, Typography, Row, Col, Space, List, Tag, theme, Progress, Card } from "antd";
import { LineChartOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface TestSummaryModalProps {
  open: boolean;
  onClose: () => void;
  answers: boolean[];
  questionCount: number;
  timeTaken: number | null;
}

export default function TestSummaryModal({
  open,
  onClose,
  answers,
  questionCount,
  timeTaken
}: TestSummaryModalProps) {
  const { token } = theme.useToken();

  const correctAnswers = answers.filter(Boolean).length;
  const percentage = questionCount > 0
    ? Math.round((correctAnswers / questionCount) * 100)
    : 0;

  const formattedTime = timeTaken
    ? new Date(timeTaken).toISOString().substring(14, 19)
    : "00:00";

  const results = answers.map((correct, index) => ({
    question: `Pregunta ${index + 1}`,
    correct
  }));

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={800}
      bodyStyle={{
        backgroundColor: token.colorBgLayout,
        padding: token.paddingLG,
        borderRadius: token.borderRadiusLG,
      }}
    >
      <Card
        bordered={false}
        style={{
          backgroundColor: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadow,
          padding: token.paddingLG,
        }}
      >
        <Row gutter={[24, 24]} align="middle">
          {/* Columna izquierda: gráfico circular */}
          <Col xs={24} md={8} style={{ textAlign: "center" }}>
            <Progress
              type="circle"
              percent={percentage}
              size={160}
              strokeColor="#3b82f6"
              format={(p) => `${p}%`}
            />
            <div style={{ marginTop: token.marginSM }}>
              <Text strong style={{ fontSize: 16 }}>
                Porcentaje de éxito
              </Text>
            </div>
            <div style={{ marginTop: token.marginSM }}>
              <Text strong>Tiempo empleado:</Text>{" "}
              <Text>{formattedTime}</Text>
            </div>
          </Col>

          {/* Columna derecha: detalle por pregunta */}
          <Col xs={24} md={16}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Title level={4} style={{ marginBottom: 0 }}>
                Resumen del examen
              </Title>
              <List
                header={<Text strong>Detalle por pregunta</Text>}
                dataSource={results}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      backgroundColor: token.colorBgLayout,
                      borderRadius: token.borderRadiusSM,
                      padding: "8px 12px",
                    }}
                  >
                    <Text>{item.question}:</Text>{" "}
                    <Tag
                      color={item.correct ? "#3b82f6" : "#94a3b8"}
                      style={{
                        border: "none",
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      {item.correct ? "Bien" : "Mal"}
                    </Tag>
                  </List.Item>
                )}
              />
            </Space>
          </Col>
        </Row>
      </Card>
    </Modal>
  );
}
