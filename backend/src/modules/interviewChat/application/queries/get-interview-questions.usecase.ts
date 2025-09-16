// // application/usecases/get-interview-questions.usecase.ts
// import { Inject, Injectable, Logger } from '@nestjs/common';
// import { INTERVIEW_QUESTION_REPO } from '../../tokens';
// import type { InterviewQuestionRepositoryPort } from '../../domain/ports/interview-question.repository.ports';
// import { InterviewQuestion } from '../../domain/entities/interviewQuestion.entity';

// @Injectable()
// export class GetInterviewQuestionsUseCase {
//   private readonly logger = new Logger(GetInterviewQuestionsUseCase.name);

//   constructor(
//     @Inject(INTERVIEW_QUESTION_REPO)
//     private readonly interviewQuestionRepo: InterviewQuestionRepositoryPort,
//   ) {}

//   async execute(
//     classId: string,
//     topic: string,
//     count: number = 5,
//   ): Promise<InterviewQuestion[]> {
//     try {
//       this.logger.log(
//         `Buscando preguntas para clase: ${classId}, tema: ${topic}`,
//       );

//       // 1. Buscar preguntas existentes para esta clase
//       const existingQuestions =
//         await this.interviewQuestionRepo.findByClassIdAndTopic(
//           classId,
//           topic,
//           count * 2, // Buscar más para tener opciones de filtrado
//         );

//       // Filtrar preguntas no usadas recientemente
//       const unusedQuestions = existingQuestions.filter(
//         (q) => !q.isRecentlyUsed(),
//       );

//       // 2. Si tenemos suficientes preguntas no usadas, las retornamos
//       if (unusedQuestions.length >= count) {
//         this.logger.log(
//           `Reutilizando ${count} preguntas existentes de clase ${classId}`,
//         );

//         const questionsToUse = unusedQuestions.slice(0, count);
//         await this.updateLastUsedDates(questionsToUse);

//         return questionsToUse;
//       }

//       // 3. Si no hay suficientes, generar nuevas con IA
//       const questionsNeeded = count - unusedQuestions.length;
//       this.logger.log(
//         `Generando ${questionsNeeded} nuevas preguntas para clase ${classId}`,
//       );

//       // 4. Crear nuevas entities relacionadas con la clase
//       const newQuestions = await this.createNewQuestions(
//         classId,
//       );

//       // 5. Actualizar fechas de preguntas existentes que usaremos
//       if (unusedQuestions.length > 0) {
//         await this.updateLastUsedDates(
//           unusedQuestions.slice(0, unusedQuestions.length),
//         );
//       }

//       // 6. Combinar y retornar
//       return [...unusedQuestions, ...newQuestions].slice(0, count);
//     } catch (error) {
//       this.logger.error(
//         `Error obteniendo preguntas para clase ${classId}: ${error.message}`,
//       );
//       throw error;
//     }
//   }

//   private async updateLastUsedDates(
//     questions: InterviewQuestion[],
//   ): Promise<void> {
//     const updatePromises = questions.map((question) => {
//       question.markAsUsed();
//       return this.interviewQuestionRepo.save(question);
//     });
//     await Promise.all(updatePromises);
//   }

//   private async createNewQuestions(
//     classId: string,
//     questionsText: string[],
//   ): Promise<InterviewQuestion[]> {
//     // const savePromises = questionsText.map((text) =>
//     //   this.interviewQuestionRepo.create({
//     //     classId,
//     //     text,
//     //     lastUsedAt: new Date(),
//     //   }),
//     // );

//     return Promise.all(savePromises);
//   }
// }
