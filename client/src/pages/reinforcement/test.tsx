import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTemplate from "../../components/PageTemplate";
import TestModal from "../../components/tests/TestModal";
import TestRunner from "../../components/tests/TestRunner";
import TestSummaryModal from "../../components/tests/TestSummaryModal";
import { useStudentTest } from "../../hooks/useStudentTest";
import TimerDisplay from "../../components/tests/Timer";

export default function Test() {
  const navigate = useNavigate();
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const {
    isTestModalOpen,
    closeTestModal,
    startExam,
    questionCount,
    currentQuestion,
    answers,
    startTime,
    endTime,
    nextQuestion,
    recordAnswer,
    timeLeft,
    totalTime,
    finishExam
  } = useStudentTest(() => setShowSummary(true));

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
        />
      )}
      {isExamStarted && (
        <>
          <TimerDisplay timeLeft={timeLeft} totalTime={totalTime} />
          <div style={{ width: "100%", minHeight: 300 }}>
            <TestRunner onAnswered={handleNextQuestion} />
          </div>
        </>
      )}
      {showSummary && (
        <TestSummaryModal
          open={showSummary}
          onClose={handleCloseSummary}
          answers={answers}
          questionCount={questionCount}
          timeTaken={startTime && endTime ? endTime - startTime : null}
        />
      )}
    </PageTemplate>
  );
}
