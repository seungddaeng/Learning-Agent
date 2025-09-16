import { Injectable, Logger, Inject } from '@nestjs/common';
import type { DocumentRepositoryPort } from '../../domain/ports/document-repository.port';
import type { DocumentChunkRepositoryPort } from '../../domain/ports/document-chunk-repository.port';
import type { DocumentIndexGeneratorPort } from '../../domain/ports/document-index-generator.port';
import { DocumentIndex } from '../../domain/entities/document-index.entity';
import {
  DOCUMENT_REPOSITORY_PORT,
  DOCUMENT_CHUNK_REPOSITORY_PORT,
  DOCUMENT_INDEX_GENERATOR_PORT,
} from '../../tokens';

export interface GenerateDocumentIndexCommand {
  documentId: string;
  config?: {
    language?: string;
    detailLevel?: 'basic' | 'intermediate' | 'advanced';
    exerciseTypes?: string[];
  };
}

@Injectable()
export class GenerateDocumentIndexUseCase {
  private readonly logger = new Logger(GenerateDocumentIndexUseCase.name);

  constructor(
    @Inject(DOCUMENT_REPOSITORY_PORT)
    private readonly documentRepository: DocumentRepositoryPort,
    @Inject(DOCUMENT_CHUNK_REPOSITORY_PORT)
    private readonly chunkRepository: DocumentChunkRepositoryPort,
    @Inject(DOCUMENT_INDEX_GENERATOR_PORT)
    private readonly indexGenerator: DocumentIndexGeneratorPort,
  ) {}

  async execute(command: GenerateDocumentIndexCommand): Promise<DocumentIndex> {
    const { documentId, config } = command;

    try {
      this.logger.log(
        `Starting index generation for document: ${documentId}`,
      );

      // 1. Verificar que el documento existe
      const document = await this.documentRepository.findById(documentId);
      if (!document) {
        throw new Error(`Document with ID ${documentId} not found`);
      }

      this.logger.log(`Document found: ${document.originalName}`);

      // 2. Obtener todos los chunks del documento
      const chunksResult =
        await this.chunkRepository.findByDocumentId(documentId);
      if (
        !chunksResult ||
        !chunksResult.chunks ||
        chunksResult.chunks.length === 0
      ) {
        throw new Error(
          `No chunks found for document ${documentId}`,
        );
      }

      const chunks = chunksResult.chunks;
      this.logger.log(`Found ${chunks.length} chunks to process`);

      // 3. Generar el índice con ejercicios usando el LLM
      const documentIndex = await this.indexGenerator.generateDocumentIndex(
        documentId,
        document.documentTitle || document.originalName,
        chunks,
        config,
      );

      this.logger.log(
        `Index generated successfully with ${documentIndex.chapters.length} chapters`,
      );

      // Log detallado del contenido generado
      let totalExercises = 0;
      documentIndex.chapters.forEach((chapter, chapterIndex) => {
        const chapterExercises = chapter.exercises.length;
        const subtopicExercises = chapter.subtopics.reduce(
          (sum, subtopic) => sum + subtopic.exercises.length,
          0,
        );
        const totalChapterExercises = chapterExercises + subtopicExercises;
        totalExercises += totalChapterExercises;

        this.logger.log(
          `Chapter ${chapterIndex + 1}: "${chapter.title}" - ${totalChapterExercises} exercises`,
        );
      });

      this.logger.log(`Total exercises generated: ${totalExercises}`);

      return documentIndex;
    } catch (error) {
      this.logger.error(
        `Error generating index for document ${documentId}:`,
        error,
      );
      throw new Error(
        `Error generating index: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
