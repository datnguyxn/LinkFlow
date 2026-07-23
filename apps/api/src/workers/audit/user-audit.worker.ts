import { AuditLogRepository } from '../../modules/audit-log/repository/audit-log.repository.ts';
import { consumer } from '../../infrastructure/queue/index.ts';
import {
    RABBITMQ_EXCHANGE,
    RABBITMQ_QUEUE,
    RABBITMQ_ROUTING_KEY,
} from '../../common/constants/index.ts';
import { AUDIT_ACTION, AUDIT_RESOURCE } from '../../common/constants/audit.constant.ts';

import type { 
    UserProfileUpdatedEvent,
    UserPasswordChangedEvent,
    UserAvatarUpdatedEvent,
    UserAccountDeletedEvent,
} from '../../events/index.ts';
import { createAuditLog } from '../../utils/create-audit.util.ts';

export class UserAuditWorker {
    constructor(private readonly auditRepository: AuditLogRepository) { }

    async start() {
        // Consume user profile updated events and create audit logs
        await consumer.consume<UserProfileUpdatedEvent>(
            RABBITMQ_EXCHANGE.USER,
            RABBITMQ_ROUTING_KEY.USER_PROFILE_UPDATED,
            RABBITMQ_QUEUE.AUDIT_USER_PROFILE_UPDATED,

            async (event) => {
                await createAuditLog({
                    user: {
                        connect: {
                            id: event.userId,
                        },
                    },

                    action: AUDIT_ACTION.USER_PROFILE_UPDATED,

                    resource: AUDIT_RESOURCE.USER,

                    resourceId: event.userId,

                    metadata: {
                        updatedBy: event.updatedBy,
                        updatedAt: event.updatedAt,
                        changedFields: event.changedFields,
                    },

                    ipAddress: event.ipAddress || null,
                }, this.auditRepository);

                console.log(`Audit log created for user profile update: ${event.userId}`);
            },
        );

        await consumer.consume<UserPasswordChangedEvent>(
            RABBITMQ_EXCHANGE.USER,
            RABBITMQ_ROUTING_KEY.USER_PASSWORD_CHANGED,
            RABBITMQ_QUEUE.AUDIT_USER_PASSWORD_CHANGED,

            async (event) => {
                await createAuditLog({
                    user: {
                        connect: {
                            id: event.userId,
                        },
                    },

                    action: AUDIT_ACTION.USER_PASSWORD_CHANGED,

                    resource: AUDIT_RESOURCE.USER,

                    resourceId: event.userId,

                    metadata: {
                        changedBy: event.changedBy,
                        changedAt: event.changedAt,
                    },

                    ipAddress: event.ipAddress || null,
                }, this.auditRepository);

                console.log(`Audit log created for user password change: ${event.userId}`);
            },
        );

        await consumer.consume<UserAvatarUpdatedEvent>(
            RABBITMQ_EXCHANGE.USER,
            RABBITMQ_ROUTING_KEY.USER_AVATAR_UPDATED,
            RABBITMQ_QUEUE.AUDIT_USER_AVATAR_UPDATED,

            async (event) => {
                await createAuditLog({
                    user: {
                        connect: {
                            id: event.userId,
                        },
                    },

                    action: AUDIT_ACTION.USER_AVATAR_UPDATED,

                    resource: AUDIT_RESOURCE.USER,

                    resourceId: event.userId,

                    metadata: {
                        updatedBy: event.updatedBy,
                        updatedAt: event.updatedAt,
                    },

                    ipAddress: event.ipAddress || null,
                }, this.auditRepository);

                console.log(`Audit log created for user avatar update: ${event.userId}`);
            },
        );

        await consumer.consume<UserAccountDeletedEvent>(
            RABBITMQ_EXCHANGE.USER,
            RABBITMQ_ROUTING_KEY.USER_ACCOUNT_DELETED,
            RABBITMQ_QUEUE.AUDIT_USER_ACCOUNT_DELETED,

            async (event) => {
                await createAuditLog({
                    user: {
                        connect: {
                            id: event.userId,
                        },
                    },

                    action: AUDIT_ACTION.USER_ACCOUNT_DELETED,

                    resource: AUDIT_RESOURCE.USER,

                    resourceId: event.userId,

                    metadata: {
                        deletedBy: event.deletedBy,
                        deletedAt: event.deletedAt,
                    },

                    ipAddress: event.ipAddress || null,
                }, this.auditRepository);

                console.log(`Audit log created for user account deletion: ${event.userId}`);
            },
        );
    }
}