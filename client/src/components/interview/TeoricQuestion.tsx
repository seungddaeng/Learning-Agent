import React, { useEffect, useRef, useState } from 'react';
import { Button, Typography, theme, Radio } from 'antd';
import { RightOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import apiClient from '../../api/apiClient';
import type { MultipleSelectionResponse } from '../../interfaces/interviewInt';
import InterviewRunner from './InterviewRunner';

const { Paragraph, Text } = Typography;

const WIDTH = 900;
const HEIGHT = '60vh';
const TOP_OFFSET = '5vh';

interface TeoricQuestionProps {
   onNext: () => void;
   selectedValues: MultipleSelectionResponse[];
   setSelectedValues: React.Dispatch<React.SetStateAction<MultipleSelectionResponse[]>>;
}

export default function TeoricQuestion({ onNext, selectedValues, setSelectedValues }: TeoricQuestionProps) {
  const { token } = theme.useToken();
  const [mulOption, setMulOption] = useState<MultipleSelectionResponse>();
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  const onClick = () => {
    setSelectedValues( sel => [...sel, mulOption!]);
    console.log(selectedValues);
    onNext();
  }
  

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchQuestion();
  }, [selectedValues]);
  async function fetchQuestion() {
    try {
      setMulOption(undefined);
      const response = await apiClient.get("/chatint/multipleSelection?topico=fisica");
      const obj = response.data as MultipleSelectionResponse;
      setMulOption(obj);
    } catch (error) {
      console.error("Failed to fetch clases", error);
    } finally {
      setLoading(false);
    }
  }


  if (loading) return <InterviewRunner loading={true} />;
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
            onChange={(e) => setMulOption(old => old != undefined ? {...old, givenAnswer:e.target.value}:undefined)}
          >
            {mulOption.options.map((option, i) => {
              const selected = mulOption.givenAnswer == i;
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

      {mulOption.givenAnswer != undefined && (
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
            }}
          >
            Siguiente Pregunta <RightOutlined />
          </Button>
        </div>
      )}
    </div>
  );
}
