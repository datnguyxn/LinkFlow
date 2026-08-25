import { AuditLogRepository } from '../../modules/audit-log/repository/audit-log.repository.ts';
import { consumer } from '../../infrastructure/queue/index.ts';
import {
    RABBITMQ_EXCHANGE,
    RABBITMQ_QUEUE,
    RABBITMQ_ROUTING_KEY,
} from '../../common/constants/index.ts';

import type {
    UrlCreatedEvent,
    UrlUpdatedEvent,
    UrlDeletedEvent,
} from '../../events/index.ts';

import { AUDIT_ACTION, AUDIT_RESOURCE } from '../../common/constants/audit.constant.ts';
import { createAuditLog } from '../../utils/create-audit.util.ts';

export class UrlAuditWorker {
    constructor(private readonly auditRepository: AuditLogRepository) {}

    async start() {
        // Consume URL created events and create audit logs
        await consumer.consume(
            RABBITMQ_EXCHANGE.URL,
            RABBITMQ_ROUTING_KEY.URL_CREATED,
            RABBITMQ_QUEUE.AUDIT_URL_CREATED,

            async (event: UrlCreatedEvent) => {
                await createAuditLog(
                    {
                        user: {
                            connect: {
                                id: event.userId,
                            },
                        },

                        action: AUDIT_ACTION.URL_CREATED,

                        resource: AUDIT_RESOURCE.URL,

                        resourceId: event.id,

                        metadata: {
                            workspaceId: event.workspaceId,
                            shortCode: event.shortCode,
                            originalUrl: event.originalUrl,
                            createdAt: event.createdAt,
                        },

                        ipAddress: event.ipAddress || null,
                    },
                    this.auditRepository,
                );

                console.log(`Audit log created for URL creation: ${event.id}`);
            },
        );
    
        // Consume URL updated events and create audit logs
        await consumer.consume(
            RABBITMQ_EXCHANGE.URL,
            RABBITMQ_ROUTING_KEY.URL_UPDATED,
            RABBITMQ_QUEUE.AUDIT_URL_UPDATED,

            async (event: UrlUpdatedEvent) => {
                await createAuditLog(
                    {
                        user: {
                            connect: {
                                id: event.userId,
                            },
                        },

                        action: AUDIT_ACTION.URL_UPDATED,

                        resource: AUDIT_RESOURCE.URL,

                        resourceId: event.id,

                        metadata: {
                            workspaceId: event.workspaceId,
                            shortCode: event.shortCode,
                            originalUrl: event.originalUrl,
                            updatedAt: event.updatedAt,
                            changedFields: event.changedFields || [],
                        },

                        ipAddress: event.ipAddress || null,
                    },
                    this.auditRepository,
                );

                console.log(`Audit log created for URL update: ${event.id}`);
            },
        );
    
        // Consume URL deleted events and create audit logs
        await consumer.consume(
            RABBITMQ_EXCHANGE.URL,
            RABBITMQ_ROUTING_KEY.URL_DELETED,
            RABBITMQ_QUEUE.AUDIT_URL_DELETED,

            async (event: UrlDeletedEvent) => {
                await createAuditLog(
                    {
                        user: {
                            connect: {
                                id: event.userId,
                            },
                        },

                        action: AUDIT_ACTION.URL_DELETED,

                        resource: AUDIT_RESOURCE.URL,

                        resourceId: event.id,

                        metadata: {
                            workspaceId: event.workspaceId,
                            shortCode: event.shortCode,
                            originalUrl: event.originalUrl,
                            deletedAt: event.deletedAt,
                        },

                        ipAddress: event.ipAddress || null,
                    },
                    this.auditRepository,
                );

                console.log(`Audit log created for URL deletion: ${event.id}`);
            },
        );
    }
}