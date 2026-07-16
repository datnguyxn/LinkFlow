import fp from 'fastify-plugin';
import { ZodError } from 'zod';
import { HTTP_STATUS } from '../common/constants/index.ts';
import { ResponseHandler } from '../common/responses/handler.response.js';
import { AppError } from '../common/errors/index.ts';
import type { FastifyError } from 'fastify';

export default fp(async (fastify) => {
  fastify.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof ZodError) {
      return ResponseHandler.error(
        reply,
        HTTP_STATUS.BAD_REQUEST,
        request.t('request.validationFailed'),
        error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: request.t(issue.message),
          code: issue.code,
        })),
      );
    }

    if (error instanceof AppError) {
      return ResponseHandler.error(reply, error.statusCode, request.t(error.message), [
        {
          code: error.code,
          message: request.t(error.message),
        },
      ]);
    }

    // Fastify/JWT và các lỗi có statusCode
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      return ResponseHandler.error(reply, error.statusCode, request.t(error.message));
    }

    request.log.error(error);

    return ResponseHandler.error(
      reply,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      request.t('common.internalServerError'),
    );
  });
});
