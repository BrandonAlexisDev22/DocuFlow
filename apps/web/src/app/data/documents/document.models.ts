/** Mirrors the Prisma `DocumentCategory` enum of the API. */
export type DocumentCategory =
  | 'CONTRACT'
  | 'INVOICE'
  | 'REPORT'
  | 'CERTIFICATE'
  | 'OTHER';

/** Mirrors the Prisma `Document` model returned by the API. */
export interface DocumentItem {
  id: number;
  name: string;
  description: string | null;
  category: DocumentCategory;
  fileUrl: string | null;
  publicId: string | null;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface CreateDocumentRequest {
  name: string;
  description?: string;
  category: DocumentCategory;
}

export type UpdateDocumentRequest = Partial<CreateDocumentRequest>;

/** Response of GET /documents/:id/download. */
export interface DownloadUrlResponse {
  downloadUrl: string;
  expiresIn: number;
}
