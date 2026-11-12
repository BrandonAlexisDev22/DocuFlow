
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from '../../infrastructure/database/prisma.service';

import {
  CloudinaryService,
  UploadFileInput,
} from '../../infrastructure/storage/cloudinary.service';

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
export class DocumentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
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
      throw new NotFoundException(
        'Documento no encontrado',
      );
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

  // Upload document file
  async uploadFile(
    id: number,
    userId: number,
    file: UploadFileInput,
  ) {
    const document = await this.findById(id, userId);

    if (document.publicId) {
      throw new ConflictException(
        'Este documento ya tiene un archivo adjunto',
      );
    }

    const uploadedFile =
      await this.cloudinaryService.uploadFile(file);

    try {
      return await this.prisma.document.update({
        where: {
          id,
          userId,
        },
        data: {
          fileUrl: uploadedFile.fileUrl,
          publicId: uploadedFile.publicId,
          fileName: uploadedFile.fileName,
          fileType: uploadedFile.fileType,
          fileSize: uploadedFile.fileSize,
        },
      });
    } catch (error) {
      // Clean up Cloudinary if the database update fails.
      try {
        await this.cloudinaryService.deleteFile(
          uploadedFile.publicId,
        );
      } catch {
        // Preserve the original database error.
      }

      throw error;
    }
  }

  // Generate secure download URL
  async getDownloadUrl(id: number, userId: number) {
    const document = await this.findById(id, userId);

    if (!document.publicId || !document.fileName) {
      throw new NotFoundException(
        'Este documento no tiene un archivo adjunto',
      );
    }

    const downloadUrl =
      await this.cloudinaryService.generateDownloadUrl(
        document.publicId,
        document.fileName,
      );

    return {
      downloadUrl,
      expiresIn: 300,
    };
  }

  // Delete document and associated Cloudinary file
  async remove(id: number, userId: number) {
    const document = await this.findById(id, userId);

    if (document.publicId) {
      await this.cloudinaryService.deleteFile(
        document.publicId,
      );
    }

    return this.prisma.document.delete({
      where: {
        id,
        userId,
      },
    });
  }
}
