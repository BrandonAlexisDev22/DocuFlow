
import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(
    private readonly configService: ConfigService,
  ) {
    const cloudName = this.configService.getOrThrow<string>(
      'CLOUDINARY_CLOUD_NAME',
    );

    const apiKey = this.configService.getOrThrow<string>(
      'CLOUDINARY_API_KEY',
    );

    const apiSecret = this.configService.getOrThrow<string>(
      'CLOUDINARY_API_SECRET',
    );

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  async uploadFile(file: string) {
    try {
      const result = await cloudinary.uploader.upload(file, {
        resource_type: 'raw',
        folder: 'docuflow/documents',
      });

      return {
        fileUrl: result.secure_url,
        publicId: result.public_id,
        fileName: result.original_filename,
        fileType: result.format,
        fileSize: result.bytes,
      };
    } catch {
      throw new InternalServerErrorException(
        'Error al subir el archivo a Cloudinary',
      );
    }
  }

  async deleteFile(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(
        publicId,
        {
          resource_type: 'raw',
          invalidate: true,
        },
      );

      if (result.result !== 'ok') {
        throw new Error('Cloudinary no pudo eliminar el archivo');
      }

      return result;
    } catch {
      throw new InternalServerErrorException(
        'Error al eliminar el archivo de Cloudinary',
      );
    }
  }
}
