
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
} from '@nestjs/common';

import { DocumentsService } from '../../application/documents/documents.service';
import { JwtAuthGuard } from '../../infrastructure/security/guards/jwt-auth.guard';

import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

type AuthenticatedRequest = {
  user: {
    userId: number;
    email: string;
  };
};

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
  ) {}

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.documentsService.create(
      req.user.userId,
      dto,
    );
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.documentsService.findAll(
      req.user.userId,
    );
  }

  @Get(':id')
  findById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.documentsService.findById(
      id,
      req.user.userId,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(
      id,
      req.user.userId,
      dto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.documentsService.remove(
      id,
      req.user.userId,
    );
  }
}
