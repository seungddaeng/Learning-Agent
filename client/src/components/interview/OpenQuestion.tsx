import { useState, useRef, useEffect } from 'react';
import { Input, Button, theme, Typography } from 'antd';
import { SendOutlined, RightOutlined, MessageOutlined } from '@ant-design/icons';
import apiClient from '../../api/apiClient';

const { Text } = Typography;

const WIDTH = 900;
const HEIGHT = '60vh';
const TOP_OFFSET = '5vh'; 

const TypingIndicator: React.FC<{ token: any }> = ({ token }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: token.sizeMD / 3,
      padding: token.paddingSM,
      borderRadius: token.borderRadiusLG,
      backgroundColor: token.colorBgContainer,
      boxShadow: token.boxShadow,
      maxWidth: 'fit-content',
    }}
  >
    {[0, 0.2, 0.4].map((delay, i) => (
      <div
        key={i}
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: token.colorPrimary,
          animation: 'pulse 1s infinite ease-in-out',
          animationDelay: `${delay}s`,
        }}
      />
    ))}
  </div>
);

const ChatMessage: React.FC<{ text: string; isUser: boolean; token: any }> = ({ text, isUser, token }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: token.marginMD,
    }}
  >
    <div
      style={{
        padding: `${token.paddingSM + 2}px ${token.paddingLG}px`,
        borderRadius: token.borderRadiusLG,
        maxWidth: '75%',
        backgroundColor: isUser ? token.colorPrimary : token.colorBgContainer,
        color: isUser ? token.colorTextLightSolid : token.colorText,
        boxShadow: token.boxShadow,
        fontSize: token.fontSize,
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
      }}
    >
      {text}
    </div>
  </div>
);

export default function OpenQuestion({ onNext }: { onNext: () => void }) {
  const { token } = theme.useToken();
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(true);
  const [showNextButton, setShowNextButton] = useState(false);
  const hasFetchedInitial = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse {
        0%,100% { transform: scale(1); opacity: .5; }
        50%    { transform: scale(1.2); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (hasFetchedInitial.current) return;
    hasFetchedInitial.current = true;
    (async () => {
      setIsBotTyping(true);
      await fetchQuestion();
      setIsBotTyping(false);
      setInputDisabled(false);
    })();
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isBotTyping, showNextButton]);

  async function fetchQuestion() {
    try {
      const response = await apiClient.get("/chatint/question?topico=fisica");
      const { question } = await response.data;
      setMessages((m) => [...m, { sender: 'bot', text: question }]);
    } catch (error) {
      console.error(error);
    }
  }

  async function sendAnswer() {
    const answer = inputValue.trim();
    if (!answer || isBotTyping) return;
    const lastQuestion = messages[messages.length - 1]?.text || '';
    setMessages((m) => [...m, { sender: 'user', text: answer }]);
    setInputValue('');
    setInputDisabled(true);
    setIsBotTyping(true);
    try {
      const { data } = await apiClient.post("/chatint/advice", {
        question: lastQuestion,
        answer,
        topic: 'fisica',
      });
      setMessages((m) => [...m, { sender: 'bot', text: data.coaching_advice || 'Error.' }]);
    } catch {
      setMessages((m) => [...m, { sender: 'bot', text: 'Hubo un error.' }]);
    } finally {
      setIsBotTyping(false);
      setInputDisabled(false);
      setShowNextButton(true);
    }
  }

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
          <MessageOutlined style={{ marginRight: token.marginSM, color: token.colorPrimary }} />
          <Text style={{ fontSize: '1.25rem', fontWeight: 500, color: token.colorTextHeading }}>
            Interview
          </Text>
        </div>
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: token.paddingLG,
            backgroundColor: token.colorBgLayout,
          }}
        >
          {messages.map((msg, i) => (
            <ChatMessage key={i} text={msg.text} isUser={msg.sender === 'user'} token={token} />
          ))}
          {isBotTyping && <TypingIndicator token={token} />}
        </div>
        {!showNextButton && (
          <div
            style={{
              borderTop: `1px solid ${token.colorBorderSecondary}`,
              display: 'flex',
              alignItems: 'center',
              padding: token.paddingSM,
              backgroundColor: token.colorBgContainer,
            }}
          >
            <Input
              placeholder="Escribe tu respuesta..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={sendAnswer}
              disabled={inputDisabled || isBotTyping}
              size="large"
              style={{
                borderRadius: token.borderRadiusLG,
                marginRight: token.marginSM,
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={sendAnswer}
              disabled={inputDisabled || isBotTyping}
              style={{
                borderRadius: '50%',
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          </div>
        )}
      </div>

      {showNextButton && (
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
