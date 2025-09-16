import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { ChatRepository } from './chat-db/chat-db.repository';

@Module({
  imports: [PrismaModule],
  providers: [ChatRepository],
  exports: [ChatRepository],
})
export class ChatHistoryDbModule {}
