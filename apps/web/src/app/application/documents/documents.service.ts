import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';

import { DocumentsApiService } from '../../data/documents/documents-api.service';
import {
  CreateDocumentRequest,
  DocumentItem,
  UpdateDocumentRequest,
} from '../../data/documents/document.models';

/**
 * Use cases for documents. Components talk to this service, never to
 * HttpClient directly.
 */
@Injectable({ providedIn: 'root' })
export class DocumentsService {
  private readonly api = inject(DocumentsApiService);

  list(): Observable<DocumentItem[]> {
    return this.api.findAll();
  }

  get(id: number): Observable<DocumentItem> {
    return this.api.findById(id);
  }

  create(data: CreateDocumentRequest): Observable<DocumentItem> {
    return this.api.create(normalize(data) as CreateDocumentRequest);
  }

  update(id: number, data: UpdateDocumentRequest): Observable<DocumentItem> {
    return this.api.update(id, normalize(data));
  }

  remove(id: number): Observable<DocumentItem> {
    return this.api.remove(id);
  }

  uploadFile(id: number, file: File): Observable<DocumentItem> {
    return this.api.upload(id, file);
  }

  /** Requests a temporary URL and starts the download in the browser. */
  download(document: DocumentItem): Observable<void> {
    return this.api.getDownloadUrl(document.id).pipe(
      switchMap(({ downloadUrl }) => {
        const link = globalThis.document.createElement('a');
        link.href = downloadUrl;
        link.rel = 'noopener noreferrer';
        // The URL is served as an attachment, so the page stays in place.
        link.click();
        return of(undefined);
      }),
    );
  }
}

/** Trims text fields; an empty description is sent as an empty string. */
function normalize(data: UpdateDocumentRequest): UpdateDocumentRequest {
  const result: UpdateDocumentRequest = { ...data };
  if (result.name !== undefined) {
    result.name = result.name.trim();
  }
  if (result.description !== undefined) {
    result.description = result.description.trim();
  }
  return result;
}
