import { Client } from 'minio';
import { config } from '../../config/env/index.ts';

/**
 * Create a MinIO client instance using the configuration values from the environment.
 */
export const minioClient = new Client({
  endPoint: config.MINIO_ENDPOINT,
  port: config.MINIO_PORT,
  useSSL: config.MINIO_USE_SSL,
  accessKey: config.MINIO_ACCESS_KEY,
  secretKey: config.MINIO_SECRET_KEY,
});
