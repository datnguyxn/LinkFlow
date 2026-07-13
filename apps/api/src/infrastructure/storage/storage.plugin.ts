import fp from 'fastify-plugin';

import { MinioStorageService } from './minio-storage.service.js';

export const storageService = new MinioStorageService();

/**
 * Fastify plugin to register the storage service.
 * This plugin initializes the storage service and decorates the Fastify instance with it.
 */
export default fp(async (fastify) => {
  // Initialize the storage service before decorating the Fastify instance
  await storageService.initialize();

  // Decorate the Fastify instance with the storage service, making it accessible throughout the application
  fastify.decorate('storage', storageService);
});
