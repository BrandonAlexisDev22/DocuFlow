
import { Module } from '@nestjs/common';

import { DocumentsService } from '../../application/documents/documents.service';
import { DocumentsController } from './documents.controller';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
