import { Injectable } from '@nestjs/common';
import { Question } from '../../domain/entities/question.entity';
import type { QuestionRepositoryPort } from '../../domain/ports/question-repository.port';

@Injectable()
export class PrismaQuestionRepositoryAdapter implements QuestionRepositoryPort {
  private memory: Question[] = [];

  async save(question: Question): Promise<Question> {
    const existingIndex = this.memory.findIndex(q => q.signature === question.signature);

    if (existingIndex >= 0) {
      const updated = Question.rehydrate({
        ...this.memory[existingIndex],
        lastUsedAt: new Date(),
        uses: (this.memory[existingIndex].uses ?? 0) + 1,
      });
      this.memory[existingIndex] = updated;
      return updated;
    }

    const created = Question.rehydrate({
      ...question,
      createdAt: question.createdAt ?? new Date(),
      uses: 0,
    });
    this.memory.push(created);
    return created;
  }

  async findById(id: string): Promise<Question | null> {
    const found = this.memory.find(q => q.id === id);
    return found ? Question.rehydrate(found) : null;
  }

  async findAll(): Promise<Question[]> {
    return this.memory.map(q => Question.rehydrate(q));
  }

  async findByStatus(): Promise<Question[]> {
    return [];
  }

  async incrementUsage(id: string): Promise<void> {
    const qIndex = this.memory.findIndex(q => q.id === id);
    if (qIndex >= 0) {
      const updated = Question.rehydrate({
        ...this.memory[qIndex],
        uses: (this.memory[qIndex].uses ?? 0) + 1,
        lastUsedAt: new Date(),
      });
      this.memory[qIndex] = updated;
    }
  }
}