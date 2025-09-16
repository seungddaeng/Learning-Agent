import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatSessionDto } from './dto/create-chat-session.dto';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { UpdateChatSessionDto } from './dto/update-chat-session.dto';
import { AddContextChunkDto } from './dto/add-context-chunk.dto';
import { ChatRole } from '@prisma/client';

@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ========== SESSION OPERATIONS ==========

  async createSession(createChatSessionDto: CreateChatSessionDto) {
    try {
      // Verificar que el estudiante existe
      const student = await this.prisma.studentProfile.findUnique({
        where: { userId: createChatSessionDto.studentId },
      });

      if (!student) {
        throw new NotFoundException('Estudiante no encontrado');
      }

      // Verificar documento si se proporciona
      if (createChatSessionDto.documentId) {
        const document = await this.prisma.document.findUnique({
          where: { id: createChatSessionDto.documentId },
        });

        if (!document) {
          throw new NotFoundException('Documento no encontrado');
        }
      }

      // Verificar curso si se proporciona
      if (createChatSessionDto.courseId) {
        const course = await this.prisma.course.findUnique({
          where: { id: createChatSessionDto.courseId },
        });

        if (!course) {
          throw new NotFoundException('Curso no encontrado');
        }
      }

      return await this.prisma.chatSession.create({
        data: {
          studentId: createChatSessionDto.studentId,
          documentId: createChatSessionDto.documentId,
          courseId: createChatSessionDto.courseId,
          title: createChatSessionDto.title || 'Nueva conversación',
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  lastname: true,
                  email: true,
                },
              },
            },
          },
          document: true,
          course: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('La sesión de chat ya existe');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Referencia inválida');
      }
      throw error;
    }
  }

  async findSessionById(id: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                lastname: true,
                email: true,
              },
            },
          },
        },
        document: true,
        course: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            contextChunks: {
              include: {
                chunk: {
                  include: {
                    document: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Sesión de chat con ID ${id} no encontrada`);
    }

    return session;
  }

  async findSessionsByStudent(studentId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      this.prisma.chatSession.findMany({
        where: { studentId },
        include: {
          document: true,
          course: true,
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1, // Solo el último mensaje para preview
          },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.chatSession.count({ where: { studentId } }),
    ]);

    return {
      data: sessions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateSession(id: string, updateChatSessionDto: UpdateChatSessionDto) {
    try {
      return await this.prisma.chatSession.update({
        where: { id },
        data: updateChatSessionDto,
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  lastname: true,
                  email: true,
                },
              },
            },
          },
          document: true,
          course: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Sesión de chat con ID ${id} no encontrada`);
      }
      throw error;
    }
  }

  async deleteSession(id: string) {
    try {
      // Usar transacción para eliminar mensajes y sesión
      return await this.prisma.$transaction(async (tx) => {
        // Eliminar context chunks primero
        await tx.chatMessageContextChunk.deleteMany({
          where: {
            message: {
              sessionId: id,
            },
          },
        });

        // Eliminar mensajes
        await tx.chatMessage.deleteMany({
          where: { sessionId: id },
        });

        // Eliminar sesión
        return await tx.chatSession.delete({
          where: { id },
        });
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Sesión de chat con ID ${id} no encontrada`);
      }
      throw error;
    }
  }

  // ========== MESSAGE OPERATIONS ==========

  async createMessage(createChatMessageDto: CreateChatMessageDto) {
    try {
      // Verificar que la sesión existe
      const session = await this.prisma.chatSession.findUnique({
        where: { id: createChatMessageDto.sessionId },
      });

      if (!session) {
        throw new NotFoundException('Sesión de chat no encontrada');
      }

      const message = await this.prisma.chatMessage.create({
        data: {
          sessionId: createChatMessageDto.sessionId,
          role: createChatMessageDto.role,
          content: createChatMessageDto.content,
          tokens: createChatMessageDto.tokens,
          metadata: createChatMessageDto.metadata,
        },
        include: {
          contextChunks: {
            include: {
              chunk: true,
            },
          },
        },
      });

      // Actualizar última fecha de mensaje en la sesión
      await this.prisma.chatSession.update({
        where: { id: createChatMessageDto.sessionId },
        data: { lastMessageAt: new Date() },
      });

      return message;
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Referencia inválida');
      }
      throw error;
    }
  }

  async getMessagesBySession(sessionId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { sessionId },
        include: {
          contextChunks: {
            include: {
              chunk: {
                include: {
                  document: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.chatMessage.count({ where: { sessionId } }),
    ]);

    return {
      data: messages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async addContextToMessage(messageId: string, addContextChunkDto: AddContextChunkDto) {
    try {
      // Verificar que el mensaje existe
      const message = await this.prisma.chatMessage.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        throw new NotFoundException('Mensaje no encontrado');
      }

      // Verificar que el chunk existe
      const chunk = await this.prisma.documentChunk.findUnique({
        where: { id: addContextChunkDto.chunkId },
      });

      if (!chunk) {
        throw new NotFoundException('Chunk de documento no encontrado');
      }

      return await this.prisma.chatMessageContextChunk.create({
        data: {
          messageId,
          chunkId: addContextChunkDto.chunkId,
          relevance: addContextChunkDto.relevance,
        },
        include: {
          chunk: {
            include: {
              document: true,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('El chunk ya está asociado a este mensaje');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Referencia inválida');
      }
      throw error;
    }
  }

  async getMessageContext(messageId: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        contextChunks: {
          include: {
            chunk: {
              include: {
                document: true,
              },
            },
          },
          orderBy: { relevance: 'desc' },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    return message.contextChunks;
  }

  // ========== UTILITY METHODS ==========

  async getActiveSessionsByStudent(studentId: string) {
    return this.prisma.chatSession.findMany({
      where: {
        studentId,
        isActive: true,
      },
      include: {
        document: true,
        course: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  async getSessionWithFullContext(sessionId: string) {
    return this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                lastname: true,
                email: true,
              },
            },
          },
        },
        document: true,
        course: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            contextChunks: {
              include: {
                chunk: {
                  include: {
                    document: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async deactivateOldSessions(days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.prisma.chatSession.updateMany({
      where: {
        lastMessageAt: {
          lt: cutoffDate,
        },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });
  }
}