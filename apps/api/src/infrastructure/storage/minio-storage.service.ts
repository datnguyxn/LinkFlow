import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

import { minioClient } from './minio.client.js';

import { config } from '../../config/env/index.js';

import type { SignedUrlOptions, StorageService, UploadFileOptions, UploadResult } from './index.js';

/**
 * MinIO storage service implementation.
 * - Uses MinIO client to interact with the storage.
 * - Implements the StorageService interface.
 * - Provides methods for file upload, deletion, existence check, public URL retrieval, and signed URL generation.
 * - Ensures the storage bucket exists during initialization.
 */
export class MinioStorageService implements StorageService {
  // Flag to track if the storage service has been initialized
  private initialized = false;

  /**
   * Initialize storage.
   * Called once when server starts.
   */
  async initialize(): Promise<void> {
    // If already initialized, skip the initialization process
    if (this.initialized) {
      return;
    }

    // Ensure the storage bucket exists, creating it if necessary
    await this.ensureBucketExists();

    // Mark the storage service as initialized
    this.initialized = true;

    // Log a message indicating successful initialization
    console.log('✅ MinIO storage initialized');
  }

  /**
   * Upload any file.
   * @param options - Options for uploading the file, including folder, file name, MIME type, and buffer.
   * @returns An object containing the object key of the uploaded file.
   * @throws Error if the upload fails.
   */
  async uploadFile(options: UploadFileOptions): Promise<UploadResult> {
    // Build the object key using the provided folder and file name
    const objectKey = this.buildObjectKey(options.folder, options.fileName);

    // Upload the file to the MinIO bucket using the MinIO client
    await minioClient.putObject(
      config.MINIO_BUCKET,
      objectKey,
      options.buffer,
      options.buffer.length,
      {
        'Content-Type': options.mimeType,
      },
    );

    // Return the object key of the uploaded file
    return {
      objectKey,
    };
  }

  /**
   * Delete object.
   * @param objectKey - The key of the object to delete.
   * @returns A promise resolving when the object is deleted.
   */
  async deleteFile(objectKey: string): Promise<void> {
    await minioClient.removeObject(config.MINIO_BUCKET, objectKey);
  }

  /**
   * Check file existence.
   * @param objectKey - The key of the object to check.
   * @returns A promise resolving to a boolean indicating whether the file exists.
   */
  async fileExists(objectKey: string): Promise<boolean> {
    try {
      // Check if the object exists by attempting to retrieve its metadata
      await minioClient.statObject(config.MINIO_BUCKET, objectKey);

      // If the metadata retrieval is successful, the file exists
      return true;
    } catch {
      // If an error occurs (e.g., object not found), the file does not exist
      return false;
    }
  }

  /**
   * Public URL.
   * @param objectKey - The key of the object for which to get the public URL.
   * @returns The public URL of the object.
   * @throws Error if the public URL cannot be generated.
   *
   * Note: This method constructs the public URL based on the configured MinIO bucket and public URL.
   * Ensure that the MinIO server is configured to allow public access to the specified bucket.
   */
  getPublicUrl(objectKey: string): string {
    // Construct the public URL using the configured MinIO public URL and bucket name
    return new URL(`${config.MINIO_BUCKET}/${objectKey}`, config.MINIO_PUBLIC_URL).toString();
  }

  /**
   * Temporary signed url.
   * @param options - Options for generating the signed URL, including object key and expiration time.
   * @returns A promise resolving to the signed URL.
   * @throws Error if the signed URL cannot be generated.
   *
   * Note: This method generates a temporary signed URL that allows access to the specified object for a limited time.
   * The expiration time can be specified in seconds. If not provided, a default expiration time of 10 minutes is used.
   */
  async getSignedUrl(options: SignedUrlOptions): Promise<string> {
    // Generate a presigned GET URL for the specified object key with the provided expiration time
    return minioClient.presignedGetObject(
      config.MINIO_BUCKET,
      options.objectKey,
      options.expiresIn ?? 60 * 10,
    );
  }

  /**
   * avatars/userId/avatar.png
   */
  buildAvatarObjectKey(userId: string, originalName: string): string {
    // Extract the file extension from the original file name
    const extension = extname(originalName);

    // Construct the object key in the format "avatars/userId/uniqueId.extension"
    return this.buildObjectKey(`avatars/${userId}`, `${randomUUID()}${extension}`);
  }

  /**
   * folder/file
   * @param folder - The folder in which the file is located.
   * @param fileName - The name of the file.
   * @returns The constructed object key in the format "folder/fileName".
   *
   * Note: This method is used internally to construct the object key for files stored in MinIO.
   * It ensures that the folder and file name are combined correctly to form a valid object key.
   * The resulting object key can be used for uploading, deleting, or accessing files in the storage.
   */
  private buildObjectKey(folder: string, fileName: string): string {
    // Construct the object key by combining the folder and file name
    return `${folder}/${fileName}`;
  }

  /**
   * Ensure bucket exists.
   * @returns A promise resolving when the bucket exists or is created.
   * @throws Error if the bucket cannot be created.
   */
  private async ensureBucketExists(): Promise<void> {
    // Check if the bucket exists using the MinIO client
    const exists = await minioClient.bucketExists(config.MINIO_BUCKET);

    // If the bucket does not exist, create it using the MinIO client
    if (exists) {
      return;
    }

    // Create the bucket if it does not exist
    await minioClient.makeBucket(config.MINIO_BUCKET);
  }

  /**
   * Get file stream.
   * @param objectKey - The key of the object for which to get the file stream.
   * @returns A promise resolving to the file stream.
   * @throws Error if the file stream cannot be retrieved.
   */
  async getFileStream(objectKey: string) {
    // Retrieve the file stream for the specified object key from the MinIO bucket
    return minioClient.getObject(config.MINIO_BUCKET, objectKey);
  }

  /**
   * Get file metadata.
   * @param objectKey - The key of the object for which to get the metadata.
   * @returns A promise resolving to the file metadata.
   * @throws Error if the metadata cannot be retrieved.
   */
  async getFileMetadata(objectKey: string) {
    // Retrieve the metadata for the specified object key from the MinIO bucket
    return minioClient.statObject(config.MINIO_BUCKET, objectKey);
  }
}
