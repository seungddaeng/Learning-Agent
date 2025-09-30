import { Module } from '@nestjs/common';
import { ExamsChatController } from './infrastructure/http/exams.controller';
import { AIQuestionGenerator } from './infrastructure/ai/ai-question.generator';
import { PrismaQuestionRepositoryAdapter } from './infrastructure/persistance/prisma-question-repository.adapter';
import { PrismaAuditRepositoryAdapter } from './infrastructure/persistance/prisma-audit-repository.adapter';
import { InMemoryMetricsService } from './infrastructure/persistance/in-memory-metrics.service';
import { EXAM_AI_GENERATOR, EXAM_QUESTION_REPO } from './tokens';
import { DOCUMENT_CHUNK_REPOSITORY_PORT } from '../repository_documents/tokens';
import { GenerateOptionsForQuestionUseCase } from './application/usecases/generate-options-for-question.usecase';
import { GetOrGenerateQuestionUseCase } from './application/usecases/get-or-generate-question.usecase';
import { PublishGeneratedQuestionUseCase } from './application/usecases/publish-generated-question.usecase';
import { InterviewModule } from '../interviewChat/interview.module';
import { PromptTemplateModule } from '../prompt-template/prompt-template.module';
import { InterviewExamDbModule } from '../interview-exam-db/interview-exam-db.module';
import { DocumentsModule } from '../repository_documents/documents.module';
import { LlmModule } from '../llm/llm.module';

// The following block references AiGenModule, which is not defined/imported. Commented out as per task instructions.
// const AiGeneratorClass =
//   (AiGenModule as any).AIQuestionGenerator ??
//   (AiGenModule as any).AiQuestionGenerator ??
//   (AiGenModule as any).default;

// class AiGeneratorFallback {
//   async generateOptions(_text: string): Promise<string[]> {
//     throw new Error('AI generator not available');
//   }
// }

// const AiProvider =
//   typeof AiGeneratorClass === 'function'
//     ? { provide: EXAM_AI_GENERATOR, useClass: AiGeneratorClass }
//     : { provide: EXAM_AI_GENERATOR, useClass: AiGeneratorFallback };

@Module({
  imports: [
    InterviewModule,
    PromptTemplateModule,
    InterviewExamDbModule,
    DocumentsModule,
    LlmModule,
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
