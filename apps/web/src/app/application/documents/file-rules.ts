/** Same rules the API enforces in DocumentsController. */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILES: Readonly<Record<string, string>> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export const ACCEPTED_FILE_TYPES = Object.keys(ALLOWED_FILES).join(',');

/** Returns an error message, or null when the file is acceptable. */
export function validateFile(file: File): string | null {
  const dotIndex = file.name.lastIndexOf('.');
  const extension =
    dotIndex >= 0 ? file.name.slice(dotIndex).toLowerCase() : '';
  const expectedType = ALLOWED_FILES[extension];

  if (!expectedType || (file.type && file.type !== expectedType)) {
    return 'Formato no permitido. Solo se aceptan archivos PDF, DOC y DOCX.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'El archivo supera el tamaño máximo de 10 MB.';
  }
  if (file.size === 0) {
    return 'El archivo está vacío.';
  }
  return null;
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) {
    return '—';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toLocaleString('es', { maximumFractionDigits: 1 })} ${units[unit]}`;
}

export function getFileExtension(fileName: string | null): string {
  if (!fileName || !fileName.includes('.')) {
    return 'DOC';
  }
  return fileName.split('.').pop()!.toUpperCase();
}
