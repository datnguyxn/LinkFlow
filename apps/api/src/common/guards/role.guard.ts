import type { FastifyRequest } from "fastify";
import { ForbiddenError } from "../errors/forbidden.error.ts";
import { ERROR_CODE } from "../constants/index.ts";

export function roleGuard(...roles: string[]) {
    return async (
        request: FastifyRequest
    ) => {
        if (!request.user) {
            throw new ForbiddenError(request.t("auth.middleware.forbidden"), ERROR_CODE.FORBIDDEN);
        }

        if (!roles.includes(request.user.role)) {
            throw new ForbiddenError(request.t("auth.middleware.forbidden"), ERROR_CODE.FORBIDDEN);
        }
    };
}