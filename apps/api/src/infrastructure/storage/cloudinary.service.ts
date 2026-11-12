
import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export type UploadFileInput = {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
};

@Injectable()
export class CloudinaryService {
  constructor(
    private readonly configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>(
        'CLOUDINARY_CLOUD_NAME',
      ),
      api_key: this.configService.getOrThrow<string>(
        'CLOUDINARY_API_KEY',
      ),
      api_secret: this.configService.getOrThrow<string>(
        'CLOUDINARY_API_SECRET',
      ),
      secure: true,
    });
  }

  // Upload file to Cloudinary
  async uploadFile(data: UploadFileInput) {
    try {
      const result = await new Promise<any>(
        (resolve, reject) => {
          const upload = cloudinary.uploader.upload_stream(
            {
              resource_type: 'raw',
              type: 'authenticated',
              folder: 'docuflow/documents',
              use_filename: true,
              unique_filename: true,
            },
            (error, result) => {
              if (error) {
                reject(error);
                return;
              }

              if (!result) {
                reject(
                  new Error(
                    'Cloudinary no devolvió resultados',
                  ),
                );
                return;
              }

              resolve(result);
            },
          );

          upload.end(data.buffer);
        },
      );

      return {
        fileUrl: result.secure_url,
        publicId: result.public_id,
        fileName: data.originalName,
        fileType: data.mimeType,
        fileSize: result.bytes,
      };
    } catch {
      throw new InternalServerErrorException(
        'Error al subir el archivo a Cloudinary',
      );
    }
  }

  // Generate temporary download URL
  async generateDownloadUrl(
    publicId: string,
    fileName: string,
  ): Promise<string> {
    try {
      const extension = fileName.split('.').pop()?.toLowerCase();

      if (!extension || extension === fileName) {
        throw new Error('Extensión de archivo inválida');
      }

      return cloudinary.utils.private_download_url(
        publicId,
        extension,
        {
          resource_type: 'raw',
          type: 'authenticated',
          expires_at: Math.floor(Date.now() / 1000) + 300,
          attachment: true,
        },
      );
    } catch {
      throw new InternalServerErrorException(
        'No se pudo generar el enlace de descarga',
      );
    }
  }

  // Delete file from Cloudinary
  async deleteFile(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(
        publicId,
        {
          resource_type: 'raw',
          type: 'authenticated',
          invalidate: true,
        },
      );

      if (result.result !== 'ok') {
        throw new Error(
          'No se pudo eliminar el archivo',
        );
      }

      return result;
    } catch {
      throw new InternalServerErrorException(
        'Error al eliminar el archivo de Cloudinary',
      );
    }
  }
}
