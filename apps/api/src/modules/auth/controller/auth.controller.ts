import { AuthService } from '../service/auth.service.ts';
import { ResponseHandler } from "../../../common/responses/handler.response.js";
import type { FastifyRequest, FastifyReply } from "fastify";
import { HTTP_STATUS } from "../../../common/constants/index.ts";

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    async findCurrentUserByEmail(
        request: FastifyRequest<{ Params: { email: string } }>,
        reply: FastifyReply
    ) {
        const { email } = request.params;
        const user = await this.authService.getCurrentUserByEmail(email);
        return user === null
            ? ResponseHandler.error(reply, HTTP_STATUS.NOT_FOUND, request.t("common.errorData"))
            : ResponseHandler.success(reply, user, request.t("common.successData"), HTTP_STATUS.OK);
    }
}