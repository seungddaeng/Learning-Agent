import { useEffect, useState, useRef } from 'react';
import { Typography, Radio, Button, theme } from 'antd';
import { RightOutlined, CodeOutlined } from '@ant-design/icons';
import apiClient from '../../api/apiClient';
import type { DoubleOptionResponse } from '../../interfaces/interviewInt';

const { Paragraph, Text } = Typography;

const WIDTH = 900;
const HEIGHT = '60vh';
const TOP_OFFSET = '5vh';

interface MultipleQuestionProps {
  onNext: () => void;
  selectedValues: DoubleOptionResponse[];
  setSelectedValues: React.Dispatch<React.SetStateAction<DoubleOptionResponse[]>>;
}


export default function MultipleQuestion({ onNext, selectedValues, setSelectedValues }: MultipleQuestionProps) {
  const { token } = theme.useToken();
  const [doubleOption , setDoubleOption] = useState<DoubleOptionResponse>();

  const onClick = () => {
    setSelectedValues( sel => [...sel, doubleOption!]);
    console.log(selectedValues);
    onNext();
  }
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
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchQuestion();
  }, [selectedValues]);
  async function fetchQuestion() {
     try {
      setDoubleOption(undefined);
      const response = await apiClient.get("/chatint/doubleOption?topico=programacion");
      const obj = response.data as DoubleOptionResponse;
      setDoubleOption(obj);
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

  if (!doubleOption) return null;

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
          <CodeOutlined style={{ marginRight: token.marginSM, color: token.colorPrimary }} />
          <Text style={{ fontSize: '1.25rem', fontWeight: 500, color: token.colorTextHeading }}>
            Pregunta de Complejidad
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
            {doubleOption.question}
          </Paragraph>

          <Radio.Group
            onChange={(e) => setDoubleOption(old => old !=undefined? {...old,givenAnswer:e.target.value}:undefined)}
            value={doubleOption?.givenAnswer}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: token.marginMD,
              justifyContent: 'center',
            }}
          >
            {doubleOption.options.map((opt, i) => {
              const selected = doubleOption.givenAnswer === i;
              return (
                <Radio key={i} value={i} style={{ margin: 0 }}>
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
                      display: 'flex',
                      flexDirection: 'column',
                      gap: token.marginSM,
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
                      {opt.label}
                    </Paragraph>
                    <pre
                      style={{
                        backgroundColor: token.colorFillTertiary,
                        padding: `${token.paddingSM}px ${token.paddingMD}px`,
                        borderRadius: token.borderRadiusSM,
                        fontSize: token.fontSizeSM,
                        overflowX: 'auto',
                        margin: 0,
                        color: token.colorText,
                        lineHeight: 1.5,
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {opt.answer}
                    </pre>
                  </div>
                </Radio>
              );
            })}
          </Radio.Group>
        </div>
      </div>

      {doubleOption.givenAnswer != undefined && (
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
            onClick={onClick}
            style={{
              borderRadius: token.borderRadiusLG,
              height: 48,
              padding: `0 ${token.paddingLG}px`,
              fontWeight: 600,
              boxShadow: token.boxShadow,
              marginRight: 0,
            }}
          >
            Siguiente Pregunta <RightOutlined />
          </Button>
        </div>
      )}
    </div>
  );
}