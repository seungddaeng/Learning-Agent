import { Card, Typography, theme, Alert, Button } from "antd";

const { Title } = Typography;

interface TrueOrFalseQuestionProps {
  onNext: (isCorrect: boolean) => void;
  question?: string;
}

export default function TrueOrFalseQuestion({
  onNext,
  question = "",
}: TrueOrFalseQuestionProps) {
  const { token } = theme.useToken();



  const handleSelect = (_value: boolean) => {
    const action = onNext ?? (() => window.location.reload());
    setTimeout(action, parseInt(token.motionDurationMid) || 300);
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: token.marginLG,
    padding: token.paddingXL,
    backgroundColor: token.colorBgLayout,
    minHeight: "100%",
  };

  const questionCardStyle: React.CSSProperties = {
    borderRadius: token.borderRadiusLG,
    backgroundColor: token.colorBgContainer,
    borderLeft: `${token.lineWidth * 4}px solid ${token.colorPrimary}`,
    padding: token.paddingLG,
    textAlign: "center",
    maxWidth: token.screenLG,
    width: "100%",
    minHeight: 120,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const optionStyleBase: React.CSSProperties = {
    borderRadius: token.borderRadiusLG,
    backgroundColor: token.colorPrimary,
    color: token.colorTextLightSolid,
    fontWeight: token.fontWeightStrong,
    fontSize: token.fontSizeLG * 1.3,
    textAlign: "center",
    cursor: "pointer",
    transition: `transform ${token.motionDurationMid} ${token.motionEaseOut}, box-shadow ${token.motionDurationMid} ${token.motionEaseOut}`,
    boxShadow: token.boxShadow,
    userSelect: "none",
    padding: token.paddingMD,
    minHeight: 94,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",


  };

  if (!question) {
    return (
      <div style={containerStyle}>
        <Card
          style={{
            ...questionCardStyle,
            borderLeft: "none",
            boxShadow: token.boxShadow,
          }}
        >
          <Title level={4} style={{ margin: 0, color: token.colorTextHeading }}>
            Pregunta no disponible
          </Title>
        </Card>

        <Alert
          message="No se encontró la pregunta"
          description={
            <div>
              Esta vista espera recibir la pregunta desde el backend. Usa{" "}
              <strong>TestRunner</strong> para obtener preguntas generadas.
            </div>
          }
          type="info"
          showIcon
        />


        <Button onClick={() => (onNext ? onNext() : window.location.reload())}>
          Recargar
        </Button>

      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <Card style={questionCardStyle}>
        <Title
          level={4}
          style={{
            margin: 0,
            color: token.colorPrimary,
            fontWeight: token.fontWeightStrong,
          }}
        >
          {question}
        </Title>
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: token.marginMD,
          width: "100%",
          maxWidth: token.screenLG,
        }}
      >

        {[{ label: "Verdadero", value: true }, { label: "Falso", value: false }].map(
          (opt) => (
            <div
              key={opt.label}
              style={optionStyleBase}
              onClick={() => handleSelect(opt.value)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow = token.boxShadowSecondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = token.boxShadow;
              }}
            >
              {opt.label}
            </div>
          )
        )}

      </div>
    </div>
  );
}
