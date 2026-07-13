import type { FastifyReply } from 'fastify';
import type { ApiError, ApiResponse, PaginationMeta } from './api.response.js';

export class ResponseHandler {
  private static createMeta(
    pagination?: PaginationMeta,
    requestId: string = '',
  ): ApiResponse['meta'] {
    return {
      timestamp: new Date().toISOString(),
      pagination,
      requestId: requestId, // You can add a request ID here if needed
    };
  }

  static success<T>(
    reply: FastifyReply,
    data: T,
    message = 'Success',
    statusCode = 200,
    pagination?: PaginationMeta,
  ) {
    const response: ApiResponse<T> = {
      success: true,
      statusCode,
      message,
      data,
      meta: this.createMeta(pagination, reply.request.id),
    };

    return reply.status(statusCode).send(response);
  }

  static created<T>(reply: FastifyReply, data: T, message = 'Created successfully') {
    return this.success(reply, data, message, 201);
  }

  static noContent(reply: FastifyReply) {
    return reply.status(204).send();
  }

  static error(reply: FastifyReply, statusCode: number, message: string, errors?: ApiError[]) {
    const response: ApiResponse<null> = {
      success: false,
      statusCode,
      message,
      data: null,
      errors,
      meta: this.createMeta(undefined, reply.request.id),
    };

    return reply.status(statusCode).send(response);
  }
}
