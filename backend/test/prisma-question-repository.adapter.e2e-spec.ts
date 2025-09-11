import { Test } from '@nestjs/testing';
import { PublishGeneratedQuestionUseCase } from '../src/modules/exams-chat/application/usecases/publish-generated-question.usecase';
import { PrismaQuestionRepositoryAdapter } from '../src/modules/exams-chat/infrastructure/persistance/prisma-question-repository.adapter';
import { EXAM_QUESTION_REPO } from '../src/modules/exams-chat/tokens';

describe('PublishGeneratedQuestionUseCase (e2e)', () => {
  let useCase: PublishGeneratedQuestionUseCase;
  let repo: PrismaQuestionRepositoryAdapter;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PublishGeneratedQuestionUseCase,
        PrismaQuestionRepositoryAdapter,
        {
          provide: EXAM_QUESTION_REPO,
          useExisting: PrismaQuestionRepositoryAdapter,
        },
      ],
    }).compile();

    useCase = moduleRef.get(PublishGeneratedQuestionUseCase);
    repo = moduleRef.get(PrismaQuestionRepositoryAdapter);
  });

  it('should create a new question when valid text is provided', async () => {
    const result = await useCase.execute({ text: '¿Qué es NestJS?' });
    expect(result.result).toBe('created');
    expect(result).toHaveProperty('questionId');
  });

  it('should return duplicate if the same question is published again', async () => {
    await useCase.execute({ text: '¿Qué es TypeScript?' });
    const result = await useCase.execute({ text: '¿Qué es TypeScript?' });
    expect(result.result).toBe('duplicate');
  });

  it('should normalize text and detect duplicates with HTML inside', async () => {
    await useCase.execute({ text: '¿Qué es <b>JavaScript</b>?' });
    const result = await useCase.execute({ text: '¿Qué es JavaScript?' });
    expect(result.result).toBe('duplicate');
  });

  it('should mark question as invalid if confidence is below threshold', async () => {
    const result = await useCase.execute({ text: 'Pregunta con baja confianza', confidence: 0.2 });
    expect(result.result).toBe('invalid');
    expect(result).toHaveProperty('questionId');
  });

  it('should trim overly long questions to MAX_CONTENT_LENGTH', async () => {
    const longText = 'a'.repeat(2000);
    const result = await useCase.execute({ text: longText });
    expect(result.result).toBe('created');
  });

  it('should throw if input is empty or only whitespace', async () => {
    await expect(useCase.execute({ text: '' })).rejects.toThrow('Question empty after normalization');
  });
});
