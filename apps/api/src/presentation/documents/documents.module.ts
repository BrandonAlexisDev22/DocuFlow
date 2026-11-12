
import { Module } from '@nestjs/common';

import { DocumentService } from '../../application/documents/documents.service';
import { DocumentsController } from './documents.controller';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentsModule {}
