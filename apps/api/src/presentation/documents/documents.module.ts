
import { Module } from '@nestjs/common';

import { StorageModule } from '../../infrastructure/storage/storage.module';
import { DocumentService } from '../../application/documents/documents.service';
import { DocumentsController } from './documents.controller';

@Module({
  imports: [StorageModule],
  controllers: [DocumentsController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentsModule {}
