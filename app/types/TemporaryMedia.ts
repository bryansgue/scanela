// Tipos para almacenamiento temporal de media (Storage only)

export interface TemporaryMedia {
  id: string;
  path: string;
  fileName: string;
  mimeType: string;
  size: number;
  mediaType: 'image' | 'video';
  uploadedAt: string;
  expiresAt: string;
  publicUrl: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
