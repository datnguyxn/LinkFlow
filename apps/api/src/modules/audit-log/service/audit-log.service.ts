import { AuditLogRepository } from '../repository/audit-log.repository.ts';

export class AuditLogService {
    constructor(private auditLogRepository: AuditLogRepository = new AuditLogRepository()) {}

    async findAllInWorkspaceByWorkspaceId(workspaceId: string,) {
        return this.auditLogRepository.findAllInWorkspaceByWorkspaceId(workspaceId);
    }
}