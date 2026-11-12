import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CreateDocumentRequest,
  DocumentItem,
  DownloadUrlResponse,
  UpdateDocumentRequest,
} from './document.models';

@Injectable({ providedIn: 'root' })
export class DocumentsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/documents`;

  findAll(): Observable<DocumentItem[]> {
    return this.http.get<DocumentItem[]>(this.baseUrl);
  }

  findById(id: number): Observable<DocumentItem> {
    return this.http.get<DocumentItem>(`${this.baseUrl}/${id}`);
  }

  create(body: CreateDocumentRequest): Observable<DocumentItem> {
    return this.http.post<DocumentItem>(this.baseUrl, body);
  }

  update(id: number, body: UpdateDocumentRequest): Observable<DocumentItem> {
    return this.http.patch<DocumentItem>(`${this.baseUrl}/${id}`, body);
  }

  remove(id: number): Observable<DocumentItem> {
    return this.http.delete<DocumentItem>(`${this.baseUrl}/${id}`);
  }

  upload(id: number, file: File): Observable<DocumentItem> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<DocumentItem>(
      `${this.baseUrl}/${id}/upload`,
      formData,
    );
  }

  getDownloadUrl(id: number): Observable<DownloadUrlResponse> {
    return this.http.get<DownloadUrlResponse>(
      `${this.baseUrl}/${id}/download`,
    );
  }
}
