export interface TitleAndOption {
  label: string;
  answer: string;
}
export interface DoubleOptionResponse {
  question: string;
  options: TitleAndOption[];
  correctAnswer: number;
  givenAnswer?: number;
  explanation: string;
}
export interface MultipleSelectionResponse {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  givenAnswer?: number;
}