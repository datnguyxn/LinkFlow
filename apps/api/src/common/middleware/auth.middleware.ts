import type { FastifyRequest } from 'fastify';

import { JwtService } from '../../modules/auth/service/jwt.service.ts';
import { UnauthorizedError } from '../errors/unauthorized.error.ts';
import { ERROR_CODE } from '../constants/index.ts';

const jwtService = new JwtService();

export async function authMiddleware(request: FastifyRequest) {
  const authorization = request.headers.authorization;

  if (!authorization) {
    throw new UnauthorizedError(request.t('auth.middleware.missingToken'), ERROR_CODE.UNAUTHORIZED);
  }

  if (!authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError(
      request.t('auth.middleware.invalidToken'),
      ERROR_CODE.INVALID_TOKEN,
    );
  }

  const token = authorization.substring(7);

  const payload = jwtService.verifyAccessToken(token);

  request.user = {
    id: payload.id,
    email: payload.email,
    language: payload.language,
    role: payload.role,
  };
}
