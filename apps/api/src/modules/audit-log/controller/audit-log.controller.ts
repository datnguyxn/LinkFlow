import { AuditLogService } from '../service/audit-log.service.ts';
import { ResponseHandler } from '../../../common/responses/handler.response.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { HTTP_STATUS } from '../../../common/constants/index.ts';

export class AuditLogController {
    private auditLogService: AuditLogService;

    constructor() {
        this.auditLogService = new AuditLogService();
    }

    async getAllInWorkspaceByWorkspaceId(
        request: FastifyRequest<{
            Params: {
                workspaceId: string;
            };
        }>,
        reply: FastifyReply,
    ) {

        const { workspaceId } = request.params;

        const result = await this.auditLogService.findAllInWorkspaceByWorkspaceId(workspaceId);

        return ResponseHandler.success(
            reply,
            result,
            request.t('auditLog.auditLogsFetchedSuccessfully'),
            HTTP_STATUS.OK,
        );
    }
}