import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatSessionDto {
  @ApiProperty({ description: 'ID del estudiante' })
  @IsString()
  studentId: string;

  @ApiProperty({ description: 'ID del documento de contexto', required: false })
  @IsOptional()
  @IsString()
  documentId?: string;

  @ApiProperty({ description: 'ID del curso relacionado', required: false })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiProperty({ description: 'Título de la conversación', required: false })
  @IsOptional()
  @IsString()
  title?: string;
}

import { IsString, IsEnum, IsOptional, IsNumber, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChatRole } from '@prisma/client';

export class CreateChatMessageDto {
  @ApiProperty({ description: 'ID de la sesión de chat' })
  @IsString()
  sessionId: string;

  @ApiProperty({ enum: ChatRole, description: 'Rol del mensaje' })
  @IsEnum(ChatRole)
  role: ChatRole;

  @ApiProperty({ description: 'Contenido del mensaje' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Número de tokens usados', required: false })
  @IsOptional()
  @IsNumber()
  tokens?: number;

  @ApiProperty({ description: 'Metadatos adicionales', required: false })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateChatSessionDto {
  @ApiProperty({ description: 'Nuevo título de la conversación', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Estado activo/inactivo', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddContextChunkDto {
  @ApiProperty({ description: 'ID del chunk de documento' })
  @IsString()
  chunkId: string;

  @ApiProperty({ description: 'Puntuación de relevancia (0-1)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  relevance?: number;
}
import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatRequest {
  @ApiProperty({ description: 'Pregunta del usuario' })
  @IsString()
  question: string;

  @ApiProperty({ description: 'ID del estudiante', required: false })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiProperty({ description: 'ID de la sesión existente', required: false })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({ description: 'ID del documento para contexto', required: false })
  @IsOptional()
  @IsString()
  documentId?: string;

  @ApiProperty({ description: 'ID del curso relacionado', required: false })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiProperty({ description: 'Título de la sesión', required: false })
  @IsOptional()
  @IsString()
  sessionTitle?: string;

  @ApiProperty({ description: 'Metadatos adicionales', required: false })
  @IsOptional()
  @IsObject()
  metadata?: any;
}
import { ApiProperty } from '@nestjs/swagger';

export class ChatResponse {
  @ApiProperty({ description: 'Respuesta generada por la IA' })
  answer: string;

  @ApiProperty({ description: 'Modelo utilizado para la generación', required: false })
  model?: string;

  @ApiProperty({ description: 'Fuentes de información utilizadas', required: false })
  sources?: string[];

  @ApiProperty({ description: 'Razonamiento de la IA', required: false })
  reasoning?: string;

  @ApiProperty({ description: 'ID de la sesión de chat', required: false })
  sessionId?: string;

  @ApiProperty({ description: 'ID del mensaje generado', required: false })
  messageId?: string;

  @ApiProperty({ description: 'Chunks de contexto utilizados', required: false })
  contextChunks?: Array<{
    id: string;
    content: string;
    relevance: number;
    documentId: string;
  }>;
}
