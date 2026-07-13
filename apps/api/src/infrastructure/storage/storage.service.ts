/**
 * Interface representing a storage service.
 * This interface defines the methods for uploading and deleting objects in a storage system.
 */
export interface StorageService {
  uploadAvatar(input: {
    userId: string;
    buffer: Buffer;
    fileName: string;
    mimeType: string;
  }): Promise<{
    objectKey: string;
    url: string;
  }>;

  deleteObject(objectKey: string): Promise<void>;
}
