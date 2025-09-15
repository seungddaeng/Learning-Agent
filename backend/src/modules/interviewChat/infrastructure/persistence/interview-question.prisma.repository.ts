// // infrastructure/persistence/prisma/repositories/prisma-interview-question.repository.ts
// import { Injectable, Logger } from '@nestjs/common';
// import { PrismaService } from 'src/core/prisma/prisma.service';
// import { InterviewQuestion } from '../../domain/entities/interviewQuestion.entity';
// import { InterviewQuestionRepositoryPort } from '../../domain/ports/interview-question.repository.ports';

// @Injectable()
// export class PrismaInterviewQuestionRepository
//   implements InterviewQuestionRepositoryPort
// {
//   private readonly logger = new Logger(PrismaInterviewQuestionRepository.name);

//   constructor(private readonly prisma: PrismaService) {}

//   async findByClassId(
//     classId: string,
//     limit: number,
//   ): Promise<InterviewQuestion[]> {
//     const questions = await this.prisma.interviewQuestion.findMany({
//       where: { classId },
//       orderBy: [
//         { lastUsedAt: 'asc' }, // Primero las menos usadas
//         { createdAt: 'desc' },
//       ],
//       take: limit,
//     });

//     return questions.map((q) => this.toEntity(q));
//   }

//   async findByClassIdAndTopic(
//     classId: string,
//     topic: string,
//     limit: number,
//   ): Promise<InterviewQuestion[]> {
//     const questions = await this.prisma.interviewQuestion.findMany({
//       where: {
//         classId,
//         text: {
//           contains: topic,
//           mode: 'insensitive',
//         },
//       },
//       orderBy: [{ lastUsedAt: 'asc' }, { createdAt: 'desc' }],
//       take: limit,
//     });

//     return questions.map((q) => this.toEntity(q));
//   }

//   async create(
//     questionData: Omit<InterviewQuestion, 'id' | 'createdAt'>,
//   ): Promise<InterviewQuestion> {
//     const question = await this.prisma.interviewQuestion.create({
//       data: {
//         classId: questionData.classId,
//         text: questionData.text,
//         lastUsedAt: questionData.lastUsedAt,
//       },
//       include: {
//         class: true, // Incluir la relación con la clase
//       },
//     });

//     return this.toEntity(question);
//   }

//   async updateLastUsed(id: string): Promise<void> {
//     await this.prisma.interviewQuestion.update({
//       where: { id },
//       data: { lastUsedAt: new Date() },
//     });
//   }

//   async save(question: InterviewQuestion): Promise<InterviewQuestion> {
//     const updated = await this.prisma.interviewQuestion.update({
//       where: { id: question.id },
//       data: {
//         text: question.text,
//         lastUsedAt: question.lastUsedAt,
//       },
//       include: {
//         class: true,
//       },
//     });

//     return this.toEntity(updated);
//   }

//   private toEntity(prismaQuestion: any): InterviewQuestion {
//     return new InterviewQuestion(
//       prismaQuestion.id,
//       prismaQuestion.classId,
//       prismaQuestion.text,
//       prismaQuestion.createdAt,
//       prismaQuestion.lastUsedAt,
//     );
//   }
// }
