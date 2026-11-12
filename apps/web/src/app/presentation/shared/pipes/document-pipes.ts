import { Pipe, PipeTransform } from '@angular/core';

import { getCategoryLabel } from '../../../application/documents/document-categories';
import {
  formatFileSize,
  getFileExtension,
} from '../../../application/documents/file-rules';
import { DocumentCategory } from '../../../data/documents/document.models';

@Pipe({ name: 'categoryLabel' })
export class CategoryLabelPipe implements PipeTransform {
  transform(category: DocumentCategory): string {
    return getCategoryLabel(category);
  }
}

@Pipe({ name: 'fileSize' })
export class FileSizePipe implements PipeTransform {
  transform(bytes: number | null | undefined): string {
    return formatFileSize(bytes);
  }
}

@Pipe({ name: 'fileExtension' })
export class FileExtensionPipe implements PipeTransform {
  transform(fileName: string | null): string {
    return getFileExtension(fileName);
  }
}
