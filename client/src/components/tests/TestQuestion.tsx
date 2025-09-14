import { Card, Typography, theme, Alert, Button } from "antd";

const { Title } = Typography;




interface TestQuestionProps {
  onNext?: () => void;
  question?: string;
  options?: string[]; 
}

export default function TestQuestion({ onNext, question = "", options }: TestQuestionProps) {
  const { token } = theme.useToken();

  const safeOptions = Array.isArray(options) ? options : [];

  const handleSelect = (_value: string) => {
    if (onNext) {
      onNext();
    } else {
      window.location.reload();
    }
  };

  if (safeOptions.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: token.marginLG,
          padding: token.paddingLG,
          backgroundColor: token.colorBgLayout,
          minHeight: "100%",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: 800,
            textAlign: "center",
            borderRadius: token.borderRadiusLG,
            backgroundColor: token.colorBgContainer,
            boxShadow: token.boxShadow,
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
          <Button onClick={() => (onNext ? onNext() : window.location.reload())}>
            Intentar cargar / recargar
          </Button>
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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: token.marginLG,
        padding: token.paddingLG,
        backgroundColor: token.colorBgLayout,
        minHeight: "100%",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 800,
          textAlign: "center",
          borderRadius: token.borderRadiusLG,
          backgroundColor: token.colorBgContainer,
          boxShadow: token.boxShadow,
        }}
      >


        <Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
          {question}


        </Title>
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: token.marginLG,
          width: "100%",
          maxWidth: 800,
        }}
      >


        {safeOptions.map((label, index) => (
          <div
            key={index}
            onClick={() => handleSelect(String(index))}
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

          >


            {label}


          </div>
        ))}
      </div>
    </div>
  );
}
