import type { UploadFileOptions, UploadResult, SignedUrlOptions } from './storage.types.js';

/**
 * Interface representing a storage service for file operations.
 */
export interface StorageService {
  initialize(): Promise<void>;

  uploadFile(options: UploadFileOptions): Promise<UploadResult>;

  deleteFile(objectKey: string): Promise<void>;

  fileExists(objectKey: string): Promise<boolean>;

  getPublicUrl(objectKey: string): string;

  getSignedUrl(options: SignedUrlOptions): Promise<string>;
}
