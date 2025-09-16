import { useEffect, useState, useRef } from 'react';
import { Radio, Button, Typography, theme } from 'antd';
import { RightOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import apiClient from '../../api/apiClient';

const { Paragraph, Text } = Typography;

const WIDTH = 900;
const HEIGHT = '60vh';
const TOP_OFFSET = '5vh';

interface TeoricQuestionProps {
  onNext: () => void;
}
interface MultipleSelectionResponse {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function TeoricQuestion({ onNext }: TeoricQuestionProps) {
  const { token } = theme.useToken();
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [mulOption, setMulOption] = useState<MultipleSelectionResponse>();
  const [loading, setLoading] = useState(true);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const hasFetched = useRef(false);

  const loadingMessages = [
    "Accediendo a la base de datos...",
    "Cargando pregunta...",
    "Preparando interfaz...",
    "Inicializando lógica...",
    "Verificando dificultad..."
  ];

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchQuestion();
  }, []);

  async function fetchQuestion() {
    try {
      const response = await apiClient.get("/chatint/multipleSelection?topico=fisica");
      const obj = response.data as MultipleSelectionResponse;
      setMulOption(obj);
    } catch (error) {
      console.error("Failed to fetch clases", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 20,
          padding: token.paddingXL,
          gap: token.marginXL
        }}
      >
        <div className="puzzle-loader">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="piece" />
          ))}
        </div>
        <div
          style={{
            fontSize: token.fontSizeHeading3,
            fontWeight: token.fontWeightStrong,
            color: token.colorPrimary,
            textAlign: "center",
            animation: "fadePulse 1.5s infinite ease-in-out"
          }}
        >
          {loadingMessages[loadingMessageIndex]}
        </div>
        <style>
          {`
            .puzzle-loader {
              display: grid;
              grid-template-columns: repeat(2, 48px);
              grid-template-rows: repeat(2, 48px);
              gap: 16px;
            }
            .piece {
              width: 48px;
              height: 48px;
              background-color: ${token.colorPrimary};
              border-radius: 10px;
              animation: puzzleBounce 1.2s infinite ease-in-out;
            }
            .piece:nth-child(1) { animation-delay: 0s; }
            .piece:nth-child(2) { animation-delay: 0.2s; }
            .piece:nth-child(3) { animation-delay: 0.4s; }
            .piece:nth-child(4) { animation-delay: 0.6s; }

            @keyframes puzzleBounce {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.3); opacity: 0.6; }
            }

            @keyframes fadePulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}
        </style>
      </div>
    );
  }

  if (!mulOption) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        padding: token.paddingLG,
        backgroundColor: token.colorBgLayout,
      }}
    >
      <div
        style={{
          marginTop: TOP_OFFSET,
          display: 'flex',
          flexDirection: 'column',
          width: WIDTH,
          height: HEIGHT,
          backgroundColor: token.colorBgLayout,
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadow,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: token.paddingMD,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            backgroundColor: token.colorBgContainer,
          }}
        >
          <QuestionCircleOutlined style={{ marginRight: token.marginSM, color: token.colorPrimary }} />
          <Text style={{ fontSize: '1.25rem', fontWeight: 500, color: token.colorTextHeading }}>
            Pregunta Teórica
          </Text>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: token.paddingLG,
            backgroundColor: token.colorBgLayout,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: token.marginLG,
          }}
        >
          <Paragraph
            style={{
              margin: 0,
              fontWeight: 600,
              color: token.colorText,
              fontSize: token.fontSizeXL,
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            {mulOption.question}
          </Paragraph>

          <Radio.Group
            style={{
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              gap: token.marginMD,
              justifyContent: 'center',
            }}
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value)}
          >
            {mulOption.options.map((option, i) => {
              const selected = selectedValue === option;
              return (
                <Radio key={i} value={option} style={{ margin: 0 }}>
                  <div
                    style={{
                      width: 320,
                      padding: token.paddingMD,
                      borderRadius: token.borderRadiusLG,
                      border: `2px solid ${selected ? token.colorPrimary : token.colorBorderSecondary}`,
                      backgroundColor: token.colorBgContainer,
                      boxShadow: selected
                        ? `0 4px 12px ${token.colorPrimary}33`
                        : token.boxShadowSecondary,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center',
                    }}
                  >
                    <Paragraph
                      style={{
                        margin: 0,
                        fontWeight: 'bold',
                        color: token.colorText,
                        fontSize: token.fontSize,
                      }}
                    >
                      {option}
                    </Paragraph>
                  </div>
                </Radio>
              );
            })}
          </Radio.Group>
        </div>
      </div>

      {selectedValue && (
        <div
          style={{
            width: WIDTH,
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: token.marginMD,
            paddingRight: 0,
          }}
        >
          <Button
            type="primary"
            size="large"
            onClick={onNext}
            style={{
              borderRadius: token.borderRadiusLG,
              height: 48,
              padding: `0 ${token.paddingLG}px`,
              fontWeight: 600,
              boxShadow: token.boxShadow,
            }}
          >
            Siguiente Pregunta <RightOutlined />
          </Button>
        </div>
      )}
    </div>
  );
}
