import { Module } from '@nestjs/common';
import { ExamsChatController } from './infrastructure/http/exams.controller';
import { AIQuestionGenerator } from './infrastructure/ai/ai-question.generator';
import { EXAM_AI_GENERATOR, EXAM_QUESTION_REPO } from './tokens';
import { GenerateOptionsForQuestionUseCase } from './application/usecases/generate-options-for-question.usecase';
import { InterviewModule } from '../interviewChat/interview.module';
import { DsIntService } from '../interviewChat/infrastructure/dsInt.service';
import { DeepseekAdapter } from '../llm/infrastructure/adapters/ds.adapter';
import { LLM_PORT } from '../llm/tokens';
import { PromptTemplateModule } from '../prompt-template/prompt-template.module';
import { InterviewExamDbModule } from '../interview-exam-db/interview-exam-db.module';
import { DocumentsModule } from '../repository_documents/documents.module';

const AiGeneratorClass =
  (AiGenModule as any).AIQuestionGenerator ??
  (AiGenModule as any).AiQuestionGenerator ??
  (AiGenModule as any).default;

class AiGeneratorFallback {
  async generateOptions(_text: string): Promise<string[]> {
    throw new Error('AI generator not available');
  }
}

const AiProvider =
  typeof AiGeneratorClass === 'function'
    ? { provide: EXAM_AI_GENERATOR, useClass: AiGeneratorClass }
    : { provide: EXAM_AI_GENERATOR, useClass: AiGeneratorFallback };

@Module({
  imports: [
    InterviewModule,
    PromptTemplateModule,
    InterviewExamDbModule,
    DocumentsModule,
  ],
  controllers: [ExamsChatController],
  providers: [
    { provide: EXAM_AI_GENERATOR, useClass: AIQuestionGenerator },
    { provide: EXAM_QUESTION_REPO, useClass: PrismaQuestionRepositoryAdapter },
    { provide: 'AUDIT_REPO', useClass: PrismaAuditRepositoryAdapter },
    { provide: 'METRICS_SERVICE', useClass: InMemoryMetricsService },
    {
      provide: 'DOCUMENT_CHUNK_REPO',
      useExisting: DOCUMENT_CHUNK_REPOSITORY_PORT,
    },
    GenerateOptionsForQuestionUseCase,
    GetOrGenerateQuestionUseCase,
    PublishGeneratedQuestionUseCase,
  ],
})
export class ExamsChatModule {}
