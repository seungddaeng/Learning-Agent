
import { Card, Typography, theme } from "antd";

const { Title } = Typography;


interface TestQuestionProps {
  onNext: (isCorrect: boolean) => void;
  question?: string;
  options?: string[];
}

export default function TestQuestion({ onNext, question = "", options }: TestQuestionProps) {
  const { token } = theme.useToken();


  const safeOptions = Array.isArray(options) ? options : [];



  const handleSelect = (_value: string) => {
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
    fontSize: token.fontSizeLG,
    textAlign: "center",
    cursor: "pointer",
    transition: `transform ${token.motionDurationMid} ${token.motionEaseOut}, box-shadow ${token.motionDurationMid} ${token.motionEaseOut}`,
    boxShadow: token.boxShadow,
    userSelect: "none",
    padding: token.paddingMD,
    minHeight: 72,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

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

          <Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
            {question || "Pregunta no disponible"}
          </Title>
        </Card>

        <Alert
          message="No hay opciones disponibles"
          description={
            <div>


              Esta vista espera recibir <code>options</code> desde el backend. Usa{" "}
              <strong>TestRunner</strong> para obtener preguntas generadas.


            </div>
          }
          type="info"
          showIcon
        />

        <div style={{ marginTop: 8 }}>
          <Button onClick={() => onNext(false)}>Intentar cargar / recargar</Button>
        </div>
      </div>
    );
  }

  const optionColors = [
    token.colorPrimary,
    token.colorPrimaryHover,
    token.colorInfo,
    token.colorInfoHover,
  ];


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
        {safeOptions.map((label, index) => (
          <div
            key={index}


            onClick={() => handleSelect(index)}

            style={{
              backgroundColor: optionColors[index % optionColors.length],
              color: token.colorTextLightSolid,
              padding: token.paddingLG,
              borderRadius: token.borderRadiusLG,
              fontWeight: 600,
              fontSize: token.fontSizeLG,
              textAlign: "center",
              cursor: "pointer",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              boxShadow: token.boxShadow,
              userSelect: "none",
            }}


            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = token.boxShadowSecondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = token.boxShadow;
            }}

          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
