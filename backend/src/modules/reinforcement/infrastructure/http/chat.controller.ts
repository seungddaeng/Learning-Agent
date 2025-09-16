import { Body, Controller, HttpCode, Post, Req, Headers } from '@nestjs/common';
import { ChatRequest } from './dto/chat-request';
import { ChatResponse } from './dto/response';
import { DsService } from '../ds.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatRepository } from 'src/modules/chat-history/chat-db/chat-db.repository';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly dsService: DsService,
    private readonly chatService: ChatRepository,
  ) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Chat con IA con persistencia de historial' })
  @ApiResponse({ status: 200, description: 'Respuesta generada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async chatWithIA(
    @Body() dto: ChatRequest,
    @Req() request: Request,
    @Headers('x-student-id') studentIdHeader: string,
  ): Promise<ChatResponse> {
    // Obtener studentId del header o del body
    const studentId = studentIdHeader || dto.studentId;

    if (!studentId) {
      throw new Error('Student ID es requerido');
    }

    let sessionId = dto.sessionId;

    // Si no hay sessionId, crear una nueva sesión
    if (!sessionId) {
      const newSession = await this.chatService.createSession({
        studentId,
        documentId: dto.documentId,
        courseId: dto.courseId,
        title: dto.sessionTitle || 'Conversación con IA',
      });
      sessionId = newSession.id;
    }

    // 1. Guardar mensaje del usuario
    const userMessage = await this.chatService.createMessage({
      sessionId,
      role: 'USER',
      content: dto.question,
      tokens: this.estimateTokens(dto.question),
    });

    // 2. Generar respuesta con IA (usando el contexto si está disponible)
    const aiResponse = await this.dsService.generateResponse(
      dto.question,
      dto.documentId, // Pasar documentId para contexto RAG
    );

    // 3. Guardar respuesta de la IA
    const assistantMessage = await this.chatService.createMessage({
      sessionId,
      role: 'ASSISTANT',
      content: aiResponse.answer,
      tokens: this.estimateTokens(aiResponse.answer),
      metadata: {
        model: aiResponse.model,
        sources: aiResponse.sources,
        reasoning: aiResponse.reasoning,
      },
    });

    // 4. Si hay chunks de contexto, asociarlos al mensaje
    if (aiResponse.contextChunks && aiResponse.contextChunks.length > 0) {
      for (const chunk of aiResponse.contextChunks) {
        await this.chatService.addContextToMessage(assistantMessage.id, {
          chunkId: chunk.id,
          relevance: chunk.relevance,
        });
      }
    }

    // 5. Retornar respuesta con sessionId para continuar la conversación
    return {
      ...aiResponse,
      sessionId,
      messageId: assistantMessage.id,
    };
  }

  private estimateTokens(text: string): number {
    const words = text.split(/\s+/).length;
    return Math.ceil(words * 4);
  }
}
