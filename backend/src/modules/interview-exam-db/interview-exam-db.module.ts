import { Module } from '@nestjs/common';
import { IntExamRepository } from './int-exam/int-exam.repository';
import { PrismaModule } from 'src/core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [IntExamRepository],
  exports: [IntExamRepository],
})
export class InterviewExamDbModule {}
