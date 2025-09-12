import React, { useEffect, useState } from 'react';
import { Checkbox, Button, Typography, theme, Card } from 'antd';
import { RightOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import apiClient from '../../api/apiClient';
import type { MultipleSelectionResponse } from '../../interfaces/interviewInt';

const { Paragraph } = Typography;

interface TeoricQuestionProps {
   onNext: () => void;
   selectedValues: MultipleSelectionResponse[];
   setSelectedValues: React.Dispatch<React.SetStateAction<MultipleSelectionResponse[]>>;
}

export default function TeoricQuestion({ onNext, selectedValues, setSelectedValues }: TeoricQuestionProps) {
  const { token } = theme.useToken();
  const [mulOption, setMulOption] = useState<MultipleSelectionResponse>();
  const onClick = () => {
    setSelectedValues( sel => [...sel, mulOption!]);
    console.log(selectedValues);
    onNext();
  }

  useEffect(() => {
    fetchQuestion();
  }, [selectedValues]);
  async function fetchQuestion() {
    try {
      setMulOption(undefined);
      const response = await apiClient.get("/chatint/multipleSelection?topico=fisica");
      const obj = await response.data as MultipleSelectionResponse;
      console.log(obj);
      setMulOption(obj);
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
            <QuestionCircleOutlined />
            <Typography.Text style={{ fontSize: '1.25rem', fontWeight: 500 }}>
              Pregunta Teórica
            </Typography.Text>
          </div>
        }
        bordered={false}
        style={{
          width: '100%',
          maxWidth: 600,
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
             {mulOption?.question}
          </Paragraph>
        </div>

        <Checkbox.Group
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: token.marginSM,
            alignItems: 'center',
            width: '100%',
          }}
          options={mulOption?.options}
          onChange={
            (checked) => {
              checked.map(val => {
                const selected = mulOption?.options.findIndex(option => option === val);
                setMulOption(mul => mul != undefined?{...mul,givenAnswer:selected}:undefined);
              })
            }
          }
        >
          {mulOption?.options.map((option,i) => {
            return (
              <Checkbox
                key={i}
                value={option}
                style={{ width: '100%', maxWidth: 320 }}
              >
                <div
                  style={{
                    padding: `${token.paddingSM}px ${token.paddingLG}px`,
                    borderRadius: token.borderRadiusLG,
                    border: `2px solid ${mulOption?.givenAnswer == i ? token.colorPrimary : token.colorBorderSecondary}`,
                    backgroundColor: mulOption?.givenAnswer == i ? token.colorPrimaryBg : token.colorBgContainer,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                >
                  <Paragraph
                    style={{
                      margin: 0,
                      fontWeight: 'bold',
                      color: token.colorText,
                    }}
                  >
                     {option}
                  </Paragraph>
                </div>
              </Checkbox>
            );
          })}
        </Checkbox.Group>

        {mulOption?.givenAnswer !=undefined && (
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
              backgroundColor: token.colorPrimary,
            }}
          >
            Siguiente Pregunta <RightOutlined />
          </Button>
        )}
      </Card>
    </div>
  );
}
