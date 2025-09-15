import { useState, useEffect, useCallback } from "react";

export function useStudentInterview() {
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<number>(1);
  const [questionType, setQuestionType] = useState<"multiple" | "truefalse">("multiple");

  const openInterviewModal = useCallback(() => {
    setIsInterviewModalOpen(true);
  }, []);

  const closeInterviewModal = useCallback(() => {
    setIsInterviewModalOpen(false);
  }, []);

  const randomizeType = useCallback(() => {
    const types: Array<"multiple" | "truefalse"> = ["multiple", "truefalse"];
    setQuestionType(types[Math.floor(Math.random() * types.length)]);
  }, []);

  const startExam = useCallback(
    (count: number) => {
      setQuestionCount(count);
      setCurrentQuestion(1);
      randomizeType();
      setIsInterviewModalOpen(false);
    },
    [randomizeType]
  );

  const nextQuestion = useCallback(() => {
    if (currentQuestion < questionCount) {
      setCurrentQuestion((prev) => prev + 1);
      randomizeType();
    } else {
      console.log("Examen finalizado");
    }
  }, [currentQuestion, questionCount, randomizeType]);

  useEffect(() => {
    openInterviewModal();
  }, [openInterviewModal]);

  return {
    isInterviewModalOpen,
    questionCount,
    currentQuestion,
    questionType,
    openInterviewModal,
    closeInterviewModal,
    startExam,
    nextQuestion,
  };
}