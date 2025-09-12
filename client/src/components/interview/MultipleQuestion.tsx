import { useEffect, useState } from 'react';
import { Typography, Button, Card, theme, Radio } from 'antd';
import { RightOutlined, CodeOutlined } from '@ant-design/icons';
import apiClient from '../../api/apiClient';
import type { DoubleOptionResponse } from '../../interfaces/interviewInt';

const { Paragraph } = Typography;

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

  useEffect(() => {
    fetchQuestion();
  }, [selectedValues]);
  async function fetchQuestion() {
     try {
      setDoubleOption(undefined);
      const response = await apiClient.get("/chatint/doubleOption?topico=programacion");
      const obj = await response.data as DoubleOptionResponse;
      console.log(obj);
      setDoubleOption(obj);
    } catch (error) {
      console.error("Failed to fetch clases", error);
      throw error;
    }
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: token.paddingLG,
        backgroundColor: token.colorBgLayout,
      }}
    >
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: token.sizeSM }}>
            <CodeOutlined />
            <Typography.Text style={{ fontSize: '1.25rem', fontWeight: 500 }}>
              Pregunta de Complejidad
            </Typography.Text>
          </div>
        }
        bordered={false}
        style={{
          width: '100%',
          maxWidth: 800,
          backgroundColor: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadow,
        }}
        bodyStyle={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: token.paddingLG,
        }}
      >
        <div
          style={{
            padding: token.paddingMD,
            borderRadius: token.borderRadiusLG,
            backgroundColor: token.colorBgContainer,
            maxWidth: '100%',
            marginBottom: token.marginLG,
            textAlign: 'center',
          }}
        >
          <Paragraph
            style={{
              margin: 0,
              fontWeight: 'bold',
              color: token.colorText,
              fontSize: token.fontSizeLG,
            }}
          >
            {doubleOption?.question}
          </Paragraph>
        </div>

        <Radio.Group
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: token.marginMD,
            justifyContent: 'center',
          }}
          onChange={
            (e) => {setDoubleOption(double => double != undefined?{...double,givenAnswer:e.target.value}:undefined)}
          }
        >
          {doubleOption?.options.map((opt, i) => {
            return (
              <Radio key={i} value={i} style={{ margin: 0 }}>
                <div
                  style={{
                    width: 320,
                    padding: token.paddingMD,
                    borderRadius: token.borderRadiusLG,
                    border: `2px solid ${doubleOption?.givenAnswer == i ? token.colorPrimary : token.colorBorderSecondary}`,
                    backgroundColor: doubleOption?.givenAnswer == i ? token.colorPrimaryBg : token.colorBgContainer,
                    boxShadow: doubleOption?.givenAnswer == i
                      ? `0 4px 12px ${token.colorPrimary}33`
                      : '0 2px 5px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                >
                  <Paragraph
                    style={{
                      margin: 0,
                      fontWeight: 'bold',
                      color: token.colorText,
                      marginBottom: token.marginSM,
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
                    }}
                  >
                    {opt.answer}
                  </pre>
                </div>
              </Radio>
            );
          })}
        </Radio.Group>

        {doubleOption?.givenAnswer !=undefined && (
          <Button
            type="primary"
            size="large"
            onClick={onClick}
            style={{
              marginTop: token.marginLG,
              borderRadius: token.borderRadiusLG,
              height: 48,
              padding: `0 ${token.paddingLG}px`,
              fontWeight: 600,
              boxShadow: token.boxShadow,
            }}
          >
            Siguiente Pregunta <RightOutlined />
          </Button>
        )}
      </Card>
    </div>
  );
}
