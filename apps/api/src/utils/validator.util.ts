import type { FastifyRequest } from 'fastify';
import { z } from 'zod';

export function validate<T>(schema: z.ZodType<T>) {
  return async (request: FastifyRequest) => {
    request.body = schema.parse(request.body);
  };
}
