import { Injectable, Logger } from '@nestjs/common';
import type { DocumentStoragePort } from '../../domain/ports/document-storage.port';
import type { DocumentRepositoryPort } from '../../domain/ports/document-repository.port';
import type { DocumentChunkRepositoryPort } from '../../domain/ports/document-chunk-repository.port';
import { DocumentStatus } from '../../domain/entities/document.entity';

@Injectable()
export class DeleteDocumentUseCase {
  private readonly logger = new Logger(DeleteDocumentUseCase.name);

  constructor(
    private readonly storageAdapter: DocumentStoragePort,
    private readonly documentRepository: DocumentRepositoryPort,
    private readonly chunkRepository: DocumentChunkRepositoryPort,
  ) {}

  async execute(documentId: string): Promise<{
    success: boolean;
    message: string;
    deletedAt?: string;
    error?: string;
  }> {
    try {
      this.logger.log(`Starting document deletion: ${documentId}`);

      // Find document by ID in database
      const document = await this.documentRepository.findById(documentId);
      if (!document) {
        this.logger.warn(`Document not found: ${documentId}`);
        return {
          success: false,
          message: `Document with ID '${documentId}' not found`,
          error: 'DOCUMENT_NOT_FOUND',
        };
      }

      this.logger.log(
        `Document found: ${document.originalName}, Current status: ${document.status}, Hash: ${document.fileHash}`,
      );

      // Validate that file exists in storage before deleting
      const exists = await this.storageAdapter.documentExists(
        document.fileName,
      );
      if (!exists) {
        this.logger.warn(`File not found in storage: ${document.fileName}`);
        return {
          success: false,
          message: `Document file '${document.fileName}' not found in storage`,
          error: 'DOCUMENT_NOT_FOUND',
        };
      }

      this.logger.log(`File exists in storage: ${document.fileName}`);

      // Perform soft delete in storage
      this.logger.log(`Starting soft delete in storage...`);
      await this.storageAdapter.softDeleteDocument(document.fileName);
      this.logger.log(`Soft delete in storage completed`);
      // Perform soft delete of associated chunks FIRST
      this.logger.log(`Marking chunks as deleted...`);
      await this.chunkRepository.softDeleteByDocumentId(documentId);
      this.logger.log(`Chunks marked as deleted`);

      // Change document status to DELETED (soft delete)
      this.logger.log(`Marking document as deleted in database...`);

      await this.documentRepository.updateStatus(
        documentId,
        DocumentStatus.DELETED,
      );
      this.logger.log(`Document marked as deleted`);

      this.logger.log(
        `Deletion completed successfully: ${document.originalName}`,
      );

      return {
        success: true,
        message: `Document '${document.originalName}' deleted successfully`,
        deletedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error deleting document ${documentId}:`, error);
      return {
        success: false,
        message: `Failed to delete document with ID '${documentId}'`,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
