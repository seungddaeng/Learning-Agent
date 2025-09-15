import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { AiConfigService } from '../../core/ai/ai.config';
import { LlmModule } from '../llm/llm.module';
import { ChatIntController } from './infrastructure/httpchat/chatInt.controller';
import { DeepseekAdapter } from '../llm/infrastructure/adapters/ds.adapter';
import { LLM_PORT } from '../llm/tokens';

@Module({
  imports: [PrismaModule, LlmModule],
  controllers: [ChatIntController],
  providers: [
    AiConfigService,
    DeepseekAdapter,
    { provide: LLM_PORT, useExisting: DeepseekAdapter },
  ],
})
export class InterviewModule {}
