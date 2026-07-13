import 'fastify';
import { PrismaClient } from '@prisma/client';
import { TFunction } from 'i18next';
import { JwtPayload } from '../modules/auth/types/auth.type.ts';
import { StorageService } from '../infrastructure/storage/storage.interface.ts';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    storage: StorageService;

    authenticate: (request: import('fastify').FastifyRequest) => Promise<void>;
  }

  interface FastifyRequest {
    t: TFunction;

    user?: {
      id: string;
      email: string;
      language: string;
    };
  }

  interface FastifyRequest {
    user?: JwtPayload;
  }
}
