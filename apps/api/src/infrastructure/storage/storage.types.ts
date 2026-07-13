export interface UploadFileOptions {
  folder: string;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}

export interface UploadResult {
  objectKey: string;
}

export interface SignedUrlOptions {
  objectKey: string;
  expiresIn?: number;
}
