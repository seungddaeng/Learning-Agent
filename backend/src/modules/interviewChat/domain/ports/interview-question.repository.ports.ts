// import { InterviewQuestion } from '../entities/interviewQuestion.entity';

// export interface InterviewQuestionRepositoryPort {
//   findByClassId(classId: string, limit: number): Promise<InterviewQuestion[]>;
//   findByClassIdAndTopic(
//     classId: string,
//     topic: string,
//     limit: number,
//   ): Promise<InterviewQuestion[]>;
//   create(
//     question: Omit<InterviewQuestion, 'id' | 'createdAt'>,
//   ): Promise<InterviewQuestion>;
//   updateLastUsed(id: string): Promise<void>;
//   save(question: InterviewQuestion): Promise<InterviewQuestion>;
// }
