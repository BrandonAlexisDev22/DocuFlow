
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { DocumentCategory } from '../../../generated/prisma/client';

export class CreateDocumentDto {
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(150, {
    message: 'El nombre no puede superar los 150 caracteres',
  })
  name!: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(500, {
    message: 'La descripción no puede superar los 500 caracteres',
  })
  description?: string;

  @IsEnum(DocumentCategory, {
    message: 'La categoría del documento no es válida',
  })
  category!: DocumentCategory;
}
