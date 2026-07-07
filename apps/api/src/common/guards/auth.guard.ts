import type { FastifyRequest } from "fastify";
import { UnauthorizedError } from "../errors/unauthorized.error.ts";
import { ERROR_CODE } from "../constants/index.ts";

export async function authGuard(
    request: FastifyRequest
) {
    if (!request.user) {
        throw new UnauthorizedError(request.t("auth.auth.unauthorized"), ERROR_CODE.UNAUTHORIZED);
    }
}