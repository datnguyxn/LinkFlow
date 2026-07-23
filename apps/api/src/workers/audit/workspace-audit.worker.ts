import { AuditLogRepository } from '../../modules/audit-log/repository/audit-log.repository.ts';
import { consumer } from '../../infrastructure/queue/index.ts';
import {
    RABBITMQ_EXCHANGE,
    RABBITMQ_QUEUE,
    RABBITMQ_ROUTING_KEY,
} from '../../common/constants/index.ts';

import type { 
    WorkspaceCreatedEvent,
    WorkspaceUpdatedEvent,
    WorkspaceDeletedEvent,
 } from '../../events/index.ts';

import { AUDIT_ACTION, AUDIT_RESOURCE } from '../../common/constants/audit.constant.ts';
import { createAuditLog } from '../../utils/create-audit.util.ts';

export class WorkspaceAuditWorker {
    constructor(private readonly auditRepository: AuditLogRepository) { }

    async start() {
        // Consume workspace created events and create audit logs
        await consumer.consume(
            RABBITMQ_EXCHANGE.WORKSPACE,
            RABBITMQ_ROUTING_KEY.WORKSPACE_CREATED,
            RABBITMQ_QUEUE.AUDIT_WORKSPACE_CREATED,

            async (event: WorkspaceCreatedEvent) => {
                await createAuditLog({
                    user: {
                        connect: {
                            id: event.ownerId,
                        },
                    },

                    action: AUDIT_ACTION.WORKSPACE_CREATED,

                    resource: AUDIT_RESOURCE.WORKSPACE,

                    resourceId: event.workspaceId,

                    metadata: {
                        name: event.name,
                        slug: event.slug,
                        createdAt: event.createdAt,
                    },

                    ipAddress: event.ipAddress || null,
                }, this.auditRepository);

                console.log(`Audit log created for workspace creation: ${event.workspaceId}`);
            },
        );

        // Consume workspace updated events and create audit logs
        await consumer.consume(
            RABBITMQ_EXCHANGE.WORKSPACE,
            RABBITMQ_ROUTING_KEY.WORKSPACE_UPDATED,
            RABBITMQ_QUEUE.AUDIT_WORKSPACE_UPDATED,

            async (event: WorkspaceUpdatedEvent) => {
                await createAuditLog({
                    user: {
                        connect: {
                            id: event.updatedBy,
                        },
                    },

                    action: AUDIT_ACTION.WORKSPACE_UPDATED,

                    resource: AUDIT_RESOURCE.WORKSPACE,

                    resourceId: event.id,

                    metadata: {
                        changedFields: event.changedFields,
                        updatedAt: event.updatedAt,
                    },

                    ipAddress: event.ipAddress || null,
                }, this.auditRepository);

                console.log(`Audit log created for workspace update: ${event.id}`);
            },
        );

        // Consume workspace deleted events and create audit logs
        await consumer.consume(
            RABBITMQ_EXCHANGE.WORKSPACE,
            RABBITMQ_ROUTING_KEY.WORKSPACE_DELETED,
            RABBITMQ_QUEUE.AUDIT_WORKSPACE_DELETED,

            async (event: WorkspaceDeletedEvent) => {
                await createAuditLog({
                    user: {
                        connect: {
                            id: event.deletedBy,
                        },
                    },

                    action: AUDIT_ACTION.WORKSPACE_DELETED,

                    resource: AUDIT_RESOURCE.WORKSPACE,

                    resourceId: event.id,

                    metadata: {
                        deletedAt: event.deletedAt,
                    },

                    ipAddress: event.ipAddress || null,
                }, this.auditRepository);

                console.log(`Audit log created for workspace deletion: ${event.id}`);
            },
        );
    }
}