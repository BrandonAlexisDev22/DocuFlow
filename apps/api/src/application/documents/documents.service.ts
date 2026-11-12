
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../infrastructure/database/prisma.service';
import { DocumentCategory } from '../../generated/prisma/client';

export type CreateDocumentInput = {
  name: string;
  description?: string;
  category: DocumentCategory;
};

export type UpdateDocumentInput = {
  name?: string;
  description?: string;
  category?: DocumentCategory;
};

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // Create document
  async create(userId: number, data: CreateDocumentInput) {
    return this.prisma.document.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        userId,
      },
    });
  }

  // Get all documents belonging to a user
  async findAll(userId: number) {
    return this.prisma.document.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get document by ID
  async findById(id: number, userId: number) {
    const document = await this.prisma.document.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    return document;
  }

  // Update document
  async update(
    id: number,
    userId: number,
    data: UpdateDocumentInput,
  ) {
    await this.findById(id, userId);

    return this.prisma.document.update({
      where: {
        id,
        userId,
      },
      data,
    });
  }

  // Delete document
  async remove(id: number, userId: number) {
    await this.findById(id, userId);

    return this.prisma.document.delete({
      where: {
        id,
        userId,
      },
    });
  }
}
