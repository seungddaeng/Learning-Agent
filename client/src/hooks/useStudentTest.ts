import { useState, useEffect, useCallback } from "react";

export function useStudentTest(onFinish?: () => void) {
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<number>(1);
  const [questionType, setQuestionType] = useState<"multiple" | "truefalse">("multiple");
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);

  const openTestModal = useCallback(() => setIsTestModalOpen(true), []);
  const closeTestModal = useCallback(() => setIsTestModalOpen(false), []);

  const randomizeType = useCallback(() => {
    const types: Array<"multiple" | "truefalse"> = ["multiple", "truefalse"];
    setQuestionType(types[Math.floor(Math.random() * types.length)]);
  }, []);

  const startExam = useCallback((count: number) => {
    const total = count * 30;
    setQuestionCount(count);
    setCurrentQuestion(1);
    setAnswers([]);
    setStartTime(Date.now());
    setEndTime(null);
    setTotalTime(total);
    setTimeLeft(total);
    randomizeType();
    setIsTestModalOpen(false);
  }, [randomizeType]);

  const recordAnswer = useCallback((isCorrect: boolean) => {
    setAnswers(prev => [...prev, isCorrect]);
  }, []);

  const finishExam = useCallback(() => {
    setEndTime(Date.now());
    if (onFinish) onFinish();
  }, [onFinish]);

  const nextQuestion = useCallback(() => {
    if (currentQuestion < questionCount) {
      setCurrentQuestion(prev => prev + 1);
      randomizeType();
    } else {
      finishExam();
    }
  }, [currentQuestion, questionCount, randomizeType, finishExam]);

  useEffect(() => {
    openTestModal();
  }, [openTestModal]);

  useEffect(() => {
    if (totalTime === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [totalTime, finishExam]);

  return {
    isTestModalOpen,
    questionCount,
    currentQuestion,
    questionType,
    answers,
    startTime,
    endTime,
    timeLeft,
    totalTime,
    openTestModal,
    closeTestModal,
    startExam,
    nextQuestion,
    recordAnswer,
    finishExam
  };
}
