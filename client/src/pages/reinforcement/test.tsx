import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, theme } from "antd";
import PageTemplate from "../../components/PageTemplate";
import TestModal from "../../components/tests/TestModal";
import TestSummaryModal from "../../components/tests/TestSummaryModal";
import { useStudentTest } from "../../hooks/useStudentTest";
import TimerDisplay from "../../components/tests/Timer";
import TestQuestion from "../../components/tests/TestQuestion";
import TrueOrFalseQuestion from "../../components/tests/TrueOrFalseQuestion";

export default function Test() {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const {
    isTestModalOpen,
    closeTestModal,
    startExam,
    questionCount,
    currentQuestion,
    questionData,
    loading,
    error,
    answers,
    nextQuestion,
    recordAnswer,
    timeLeft,
    totalTime,
    finishExam,
    modalProps,
    getClampedTimeTaken
  } = useStudentTest("Moda", () => setShowSummary(true));

  const handleStartExam = (count: number) => {
    startExam(count);
    setIsExamStarted(true);
  };

  const handleNextQuestion = (isCorrect: boolean) => {
    recordAnswer(isCorrect);
    if (currentQuestion < questionCount) {
      nextQuestion();
    } else {
      finishExam();
    }
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
    setIsExamStarted(false);
    navigate("/reinforcement");
  };

  return (
    <PageTemplate
      title="Exámenes"
      subtitle={
        isExamStarted && questionCount
          ? `Pregunta ${currentQuestion} de ${questionCount}`
          : "Próximamente encontrarás cuestionarios y recursos para practicar"
      }
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Refuerzo", href: "/reinforcement" },
        { label: "Exámenes" },
      ]}
    >
      {!isExamStarted && (
        <TestModal
          open={isTestModalOpen}
          onClose={closeTestModal}
          onSelectDifficulty={handleStartExam}
          {...modalProps}
        />
      )}

      {isExamStarted && (
        <>
          <TimerDisplay timeLeft={timeLeft} totalTime={totalTime} />
          <div style={{ width: "100%", minHeight: 300, position: "relative" }}>
            {loading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 20,
                  padding: token.paddingLG,
                  gap: token.marginMD
                }}
              >
                <h2
                  style={{
                    fontSize: token.fontSizeHeading3,
                    fontWeight: token.fontWeightStrong,
                    color: token.colorText,
                    textAlign: "center",
                    animation: "fadePulse 1.5s infinite ease-in-out"
                  }}
                >
                  Generando pregunta...
                </h2>
                <div
                  style={{
                    width: "80%",
                    maxWidth: 420,
                    height: 16,
                    background: token.colorBorderSecondary,
                    borderRadius: token.borderRadiusLG,
                    overflow: "hidden",
                    position: "relative",
                    boxShadow: token.boxShadowTertiary
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: "40%",
                      background: token.colorPrimary,
                      position: "absolute",
                      animation: "loadingBar 1.5s infinite linear"
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
                    @keyframes fadePulse {
                      0%, 100% { opacity: 1; }
                      50% { opacity: 0.5; }
                    }
                  `}
                </style>
              </div>
            )}
            {!loading && error && (
              <Alert message={error} type="error" showIcon />
            )}
            {!loading && questionData && (
              questionData.type === "truefalse" ? (
                <TrueOrFalseQuestion
                  questionData={questionData}
                  onNext={handleNextQuestion}
                />
              ) : (
                <TestQuestion
                  questionData={questionData}
                  onNext={handleNextQuestion}
                />
              )
            )}
          </div>
        </>
      )}

      {showSummary && (
        <TestSummaryModal
          open={showSummary}
          onClose={handleCloseSummary}
          answers={answers}
          questionCount={questionCount}
          timeTaken={getClampedTimeTaken()}
        />
      )}
    </PageTemplate>
  );
}
