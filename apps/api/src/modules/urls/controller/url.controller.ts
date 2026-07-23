import type { FastifyReply } from "fastify/types/reply.js";
import { UrlService } from "../service/url.service.ts";
import type { FastifyRequest } from "fastify/types/request.js";
import type { CreateUrlInput } from "../validator/url.validator.ts";

export class UrlController {
    constructor(private urlService: UrlService = new UrlService()) { }

    async createUrl(
        request: FastifyRequest<{ Body: CreateUrlInput }>,
        reply: FastifyReply
    ) {
        //const userId = request.user?.id;
        // const workspaceId = request.workspace?.id;
    }
}