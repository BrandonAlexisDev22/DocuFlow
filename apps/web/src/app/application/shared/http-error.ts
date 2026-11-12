import { HttpErrorResponse } from '@angular/common/http';

/**
 * Turns an HTTP error into a message that can be shown to the user.
 * NestJS returns `message` as a string or as a list of validation errors.
 */
export function getErrorMessage(
  error: unknown,
  fallback = 'Ocurrió un error inesperado. Inténtalo de nuevo.',
): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión.';
  }

  if (error.status === 413) {
    return 'El archivo supera el tamaño máximo permitido (10 MB).';
  }

  const body: unknown = error.error;
  if (typeof body === 'object' && body !== null) {
    const message = (body as Record<string, unknown>)['message'];
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
    if (Array.isArray(message)) {
      const texts = message.filter(
        (item): item is string => typeof item === 'string',
      );
      if (texts.length) {
        return texts.join('. ');
      }
    }
  }

  if (error.status >= 500) {
    return 'El servidor no pudo completar la operación. Inténtalo más tarde.';
  }

  return fallback;
}
