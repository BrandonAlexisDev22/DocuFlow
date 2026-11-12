
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { extname } from 'node:path';

import { DocumentService } from 'src/application/documents/documents.service';

import { JwtAuthGuard } from '../../infrastructure/security/guards/jwt-auth.guard';

import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

type AuthenticatedRequest = {
  user: {
    userId: number;
    email: string;
  };
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    private readonly documentService: DocumentService,
  ) {}

  // Create document
  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.documentService.create(
      req.user.userId,
      dto,
    );
  }

  // Get all documents
  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.documentService.findAll(
      req.user.userId,
    );
  }

  // Get document by ID
  @Get(':id')
  findById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.documentService.findById(
      id,
      req.user.userId,
    );
  }

  // Download document
  @Get(':id/download')
  download(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.documentService.getDownloadUrl(
      id,
      req.user.userId,
    );
  }

  // Update document
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentService.update(
      id,
      req.user.userId,
      dto,
    );
  }

  // Delete document
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.documentService.remove(
      id,
      req.user.userId,
    );
  }

  // Upload document file
  @Post(':id/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1,
      },
    }),
  )
  async uploadFile(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Debes seleccionar un archivo',
      );
    }

    const extension = extname(
      file.originalname,
    ).toLowerCase();

    const expectedMimeType = ALLOWED_FILES[extension];

    if (
      !expectedMimeType ||
      file.mimetype !== expectedMimeType
    ) {
      throw new BadRequestException(
        'Formato no permitido. Solo se aceptan PDF, DOC y DOCX',
      );
    }

    return this.documentService.uploadFile(
      id,
      req.user.userId,
      {
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
      },
    );
  }
}
