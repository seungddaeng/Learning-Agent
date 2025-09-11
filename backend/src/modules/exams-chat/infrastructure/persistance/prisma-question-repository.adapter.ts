import { Injectable } from '@nestjs/common';
import { Question } from '../../domain/entities/question.entity';
import type { QuestionRepositoryPort } from '../../domain/ports/question-repository.port';
import { createSignature } from '../../utils/createSignature';
import type { Prisma } from '@prisma/client';

@Injectable()
export class PrismaQuestionRepositoryAdapter implements QuestionRepositoryPort {
  private memory: Question[] = [];
  private prisma: any | null;

  constructor(prisma?: any) {
    this.prisma = prisma ?? null;
  }

  private mapToEntity(record: any): Question {
    return Question.rehydrate({
      id: record.id,
      examId: record.examId ?? null,
      topic: record.topic ?? null,
      signature: record.signature,
      text: record.text,
      type: record.type,
      options: record.options ?? null,
      tokensGenerated: record.tokensGenerated ?? 0,
      createdAt: record.createdAt ?? new Date(),
      lastUsedAt: record.lastUsedAt ?? null,
      uses: record.uses ?? 0,
      difficulty: record.difficulty ?? null,
    });
  }

  async save(question: Question): Promise<Question> {
    if (!question.signature) {
      question.signature = createSignature({ text: question.text, options: question.options, type: question.type });
    }
    if (this.prisma) {
      const record = await this.prisma.generatedQuestion.upsert({
        where: { signature: question.signature },
        update: {
          text: question.text,
          type: question.type,
          options: question.options as Prisma.JsonValue,
          tokensGenerated: question.tokensGenerated,
          lastUsedAt: question.lastUsedAt ?? undefined,
          uses: question.uses,
          difficulty: question.difficulty ?? undefined,
          examId: question.examId ?? undefined,
          topic: question.topic ?? undefined,
        },
        create: {
          id: question.id,
          examId: question.examId ?? undefined,
          topic: question.topic ?? undefined,
          signature: question.signature,
          text: question.text,
          type: question.type,
          options: question.options as Prisma.JsonValue,
          tokensGenerated: question.tokensGenerated,
          difficulty: question.difficulty ?? undefined,
          createdAt: question.createdAt ?? new Date(),
          lastUsedAt: question.lastUsedAt ?? undefined,
          uses: question.uses ?? 0,
        },
      });
      return this.mapToEntity(record);
    } else {
      const existingIndex = this.memory.findIndex((q) => q.signature === question.signature);
      if (existingIndex >= 0) {
        const updated = Question.rehydrate({
          ...this.memory[existingIndex],
          text: question.text,
          type: question.type,
          options: question.options ?? null,
          tokensGenerated: question.tokensGenerated,
          lastUsedAt: new Date(),
          uses: (this.memory[existingIndex].uses ?? 0) + 1,
          difficulty: question.difficulty ?? null,
        });
        this.memory[existingIndex] = updated;
        return updated;
      }
      const created = Question.rehydrate({
        ...question,
        createdAt: question.createdAt ?? new Date(),
        uses: question.uses ?? 0,
      });
      this.memory.push(created);
      return created;
    }
  }

  async findById(id: string): Promise<Question | null> {
    if (this.prisma) {
      const record = await this.prisma.generatedQuestion.findUnique({ where: { id } });
      return record ? this.mapToEntity(record) : null;
    } else {
      const found = this.memory.find((q) => q.id === id);
      return found ? Question.rehydrate(found) : null;
    }
  }

  async findBySignature(signature: string): Promise<Question | null> {
    if (this.prisma) {
      const record = await this.prisma.generatedQuestion.findUnique({ where: { signature } });
      return record ? this.mapToEntity(record) : null;
    } else {
      const found = this.memory.find((q) => q.signature === signature);
      return found ? Question.rehydrate(found) : null;
    }
  }

  async findAll(): Promise<Question[]> {
    if (this.prisma) {
      const records = await this.prisma.generatedQuestion.findMany();
      return records.map((r: any) => this.mapToEntity(r));
    } else {
      return this.memory.map((q) => Question.rehydrate(q));
    }
  }

  async findByStatus(status: string, limit = 10, offset = 0): Promise<Question[]> {
    if (this.prisma) {
      const records = await this.prisma.generatedQuestion.findMany({
        where: { status },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });
      return records.map((r: any) => this.mapToEntity(r));
    } else {
      return this.memory
        .filter((q) => q.status === status)
        .slice(offset, offset + limit)
        .map((q) => Question.rehydrate(q));
    }
  }

  async incrementUsage(id: string, tokensUsed = 0): Promise<void> {
    if (this.prisma) {
      await this.prisma.generatedQuestion.update({
        where: { id },
        data: {
          uses: { increment: 1 },
          tokensGenerated: { increment: tokensUsed },
          lastUsedAt: new Date(),
        },
      });
    } else {
      const idx = this.memory.findIndex((q) => q.id === id);
      if (idx >= 0) {
        const updated = Question.rehydrate({
          ...this.memory[idx],
          uses: (this.memory[idx].uses ?? 0) + 1,
          tokensGenerated: (this.memory[idx].tokensGenerated ?? 0) + tokensUsed,
          lastUsedAt: new Date(),
        });
        this.memory[idx] = updated;
      }
    }
  }

  async deleteOlderThan(date: Date): Promise<number> {
    if (this.prisma) {
      const res = await this.prisma.generatedQuestion.deleteMany({
        where: { createdAt: { lt: date } },
      });
      return res.count;
    } else {
      const before = this.memory.length;
      this.memory = this.memory.filter((q) => q.createdAt >= date);
      return before - this.memory.length;
    }
  }

  async countByExam(examId: string): Promise<number> {
    if (this.prisma) {
      return this.prisma.generatedQuestion.count({ where: { examId } });
    } else {
      return this.memory.filter((q) => q.examId === examId).length;
    }
  }

  async pruneToLimitByExam(examId: string, limit: number): Promise<void> {
    if (this.prisma) {
      if (limit <= 0) {
        await this.prisma.generatedQuestion.deleteMany({ where: { examId } });
        return;
      }
      const toDelete = await this.prisma.generatedQuestion.findMany({
        where: { examId },
        orderBy: { createdAt: 'desc' },
        skip: limit,
        select: { id: true },
      });
      const ids = toDelete.map((d: any) => d.id);
      if (ids.length > 0) {
        await this.prisma.generatedQuestion.deleteMany({ where: { id: { in: ids } } });
      }
    } else {
      const items = this.memory.filter((q) => q.examId === examId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const toKeep = items.slice(0, limit);
      const keepIds = new Set(toKeep.map((i) => i.id));
      this.memory = this.memory.filter((q) => q.examId !== examId || keepIds.has(q.id));
    }
  }
}
