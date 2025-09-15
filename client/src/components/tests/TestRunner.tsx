import { useEffect, useState } from "react";
import { Alert, Button, theme } from "antd";
import TestQuestion from "./TestQuestion";
import TrueOrFalseQuestion from "./TrueOrFalseQuestion";

type ServerResp = {
  result: "options_generated";
  question: string;
  options: string[];
  id: string;
};

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

interface Props {
  onAnswered?: (isCorrect: boolean) => void;
}

export default function TestRunner({ onAnswered }: Props): JSX.Element {
  const { token } = theme.useToken();
  const [item, setItem] = useState<ServerResp | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestion = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/exams-chat/generate-options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText}${text ? " - " + text : ""}`);
      }

      const data = await res.json().catch(() => null);

      if (!data || typeof data.question !== "string" || !Array.isArray(data.options)) {
        throw new Error("Respuesta inválida del servidor (esperaba question + options).");
      }

      data.options = data.options.map((o: any) => String(o));
      data.question = String(data.question);

      setItem(data as ServerResp);
    } catch (err: any) {
      setError(err?.message ?? "Error desconocido al pedir la pregunta");
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  const handleNext = (isCorrect: boolean) => {
    if (onAnswered) onAnswered(isCorrect);
    fetchQuestion();
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          padding: 32,
          color: token.colorText,
          background: "transparent",
        }}
      >
        <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
          Generando pregunta...
        </h2>
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            height: 10,
            background: token.colorBorderSecondary,
            borderRadius: 5,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              height: "100%",
              width: "40%",
              background: token.colorPrimary,
              position: "absolute",
              animation: "loadingBar 1.5s infinite linear",
            }}
          />
        </div>
        <style>
          {`
            @keyframes loadingBar {
              0% { left: -40%; }
              50% { left: 30%; }
              100% { left: 100%; }
            }
          `}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <Alert message="Error al cargar la pregunta" description={error} type="error" showIcon />
        <div style={{ marginTop: 12 }}>
          <Button onClick={fetchQuestion}>Reintentar</Button>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{ padding: 16 }}>
        <Alert message="No hay pregunta cargada" type="info" showIcon />
        <div style={{ marginTop: 12 }}>
          <Button onClick={fetchQuestion}>Cargar pregunta</Button>
        </div>
      </div>
    );
  }

  if (item.options.length === 2) {
    return (
      <TrueOrFalseQuestion
        question={item.question}
        onNext={handleNext}
      />
    );
  }

  return (
    <TestQuestion
      question={item.question}
      options={item.options}
      onNext={handleNext}
    />
  );
}
