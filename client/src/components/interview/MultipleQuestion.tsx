import { useEffect, useState } from 'react';
import { Typography, Checkbox, Button, theme } from 'antd';
import { RightOutlined, CodeOutlined } from '@ant-design/icons';
import apiClient from '../../api/apiClient';
import InterviewRunner from './InterviewRunner';

const { Paragraph, Text } = Typography;

const WIDTH = 900;
const HEIGHT = '60vh';
const TOP_OFFSET = '5vh';

interface MultipleQuestionProps {
  onNext: () => void;
}
interface TitleAndOption {
  label: string;
  answer: string;
}
interface DoubleOptionResponse {
  question: string;
  options: TitleAndOption[];
  correctAnswer: number;
  explanation: string;
}

export default function MultipleQuestion({ onNext }: MultipleQuestionProps) {
  const { token } = theme.useToken();
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [doubleOption, setDoubleOption] = useState<DoubleOptionResponse>();
  const [loading, setLoading] = useState(true);

  const handleCheckboxChange = (values: string[]) => {
    setSelectedValues(values);
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  async function fetchQuestion() {
    try {
      const response = await apiClient.get("/chatint/doubleOption?topico=programacion");
      const obj = response.data as DoubleOptionResponse;
      setDoubleOption(obj);
    } catch (error) {
      console.error("Failed to fetch clases", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <InterviewRunner loading={true} />;
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
              fontWeight: 500,
              color: token.colorText,
              fontSize: token.fontSizeLG,
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            {doubleOption.question}
          </Paragraph>

          <Checkbox.Group
            onChange={(vals) => handleCheckboxChange(vals as string[])}
            value={selectedValues}
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
              const selected = selectedValues.includes(opt.answer);
              return (
                <Checkbox key={i} value={opt.answer} style={{ margin: 0 }}>
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
                        padding: token.paddingSM,
                        borderRadius: token.borderRadiusSM,
                        fontSize: token.fontSizeSM,
                        overflowX: 'auto',
                        margin: 0,
                        color: token.colorText,
                        lineHeight: 1.5,
                      }}
                    >
                      {opt.answer}
                    </pre>
                  </div>
                </Checkbox>
              );
            })}
          </Checkbox.Group>
        </div>
      </div>

      {selectedValues.length > 0 && (
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
