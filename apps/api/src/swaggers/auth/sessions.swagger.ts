import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../common/swagger/swagger-response.ts';

export const sessionsSwagger: FastifySchema = {
  tags: ['Authentication'],

  summary: 'Sessions',

  description: 'Retrieve a list of active sessions for the authenticated user.',
  response: createSwaggerResponse(
    200,
    Type.Array(
      Type.Object({
        current: Type.Boolean({
          description: 'Indicates if this session is the current active session',
          example: true,
        }),
        id: Type.String({
          description: 'Unique identifier for the session',
          example: 'session_1234567890abcdef',
        }),
        ipAddress: Type.String({
          description: 'IP address from which the session was initiated',
          example: '192.168.1.1',
        }),
        userAgent: Type.String({
          description: 'User agent string of the browser or client used for the session',
          example:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        }),
        device: Type.String({
          description: 'Device name or type from which the session was initiated',
          example: 'Chrome on Windows 10',
        }),
        os: Type.String({
          description: 'Operating system of the device used for the session',
          example: 'Windows 10',
        }),
        browser: Type.String({
          description: 'Browser name used for the session',
          example: 'Chrome',
        }),
        expiresAt: Type.String({
          description: 'Timestamp when the session will expire',
          format: 'date-time',
          example: '2023-01-02T12:00:00Z',
        }),
        createdAt: Type.String({
          description: 'Timestamp when the session was created',
          format: 'date-time',
          example: '2023-01-01T12:00:00Z',
        }),
      }),
    ),
    [400, 401, 403, 404, 500],
  ),
};
