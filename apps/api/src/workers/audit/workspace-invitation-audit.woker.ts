import { AuditLogRepository } from '../../modules/audit-log/repository/audit-log.repository.ts';
import { consumer } from '../../infrastructure/queue/index.ts';
import {
    RABBITMQ_EXCHANGE,
    RABBITMQ_QUEUE,
    RABBITMQ_ROUTING_KEY,
} from '../../common/constants/index.ts';

import type {
    WorkspaceInvitationCreatedEvent,
    WorkspaceInvitationUpdatedEvent,
} from '../../events/index.ts';

import { AUDIT_ACTION, AUDIT_RESOURCE } from '../../common/constants/audit.constant.ts';
import { createAuditLog } from '../../utils/create-audit.util.ts';

export class WorkspaceInvitationAuditWorker {
    constructor(private readonly auditRepository: AuditLogRepository) { }

    async start() {
        // Consume workspace invitation created events and create notifications
        await consumer.consume<WorkspaceInvitationCreatedEvent>(
            RABBITMQ_EXCHANGE.WORKSPACE,
            RABBITMQ_ROUTING_KEY.WORKSPACE_INVITATION_CREATED,
            RABBITMQ_QUEUE.AUDIT_WORKSPACE_INVITATION_CREATED,

            async (event) => {
                await createAuditLog({
                    user: {
                        connect: {
                            id: event.inviterId,
                        },
                    },

                    action: AUDIT_ACTION.WORKSPACE_INVITATION_CREATED,

                    resource: AUDIT_RESOURCE.WORKSPACE_INVITATION,

                    resourceId: event.invitationId,

                    metadata: {
                        workspaceId: event.workspaceId,
                        workspaceName: event.workspaceName,
                        inviterName: event.inviterName,
                        inviteeId: event.inviteeId,
                        inviteeEmail: event.inviteeEmail,
                        inviteeName: event.inviteeName,
                        roleId: event.roleId,
                        roleName: event.roleName,
                    },

                    ipAddress: event.ipAddress || null,
                }, this.auditRepository);

                console.log(`Audit log created for workspace invitation creation: ${event.invitationId}`);
            },
        );


        await consumer.consume<WorkspaceInvitationUpdatedEvent>(
            RABBITMQ_EXCHANGE.WORKSPACE,
            RABBITMQ_ROUTING_KEY.WORKSPACE_INVITATION_ACCEPTED,
            RABBITMQ_QUEUE.AUDIT_WORKSPACE_INVITATION_ACCEPTED,

            async (event) => {
                await createAuditLog({
                    user: {
                        connect: {
                            id: event.inviterId,
                        },
                    },

                    action: AUDIT_ACTION.WORKSPACE_INVITATION_ACCEPTED,

                    resource: AUDIT_RESOURCE.WORKSPACE_INVITATION,

                    resourceId: event.invitationId,

                    metadata: {
                        invitationId: event.invitationId,
                        workspaceId: event.workspaceId,

                        inviteeId: event.inviteeId,
                        inviterId: event.inviterId,
                        previousStatus: event.previousStatus,
                        status: event.status,
                        updatedAt: event.updatedAt,
                        acceptedAt: event.acceptedAt,
                    },

                    ipAddress: event.ipAddress || null,
                }, this.auditRepository);

                console.log(`Audit log created for workspace invitation update: ${event.invitationId}`);
            },
        );

        await consumer.consume<WorkspaceInvitationUpdatedEvent>(
            RABBITMQ_EXCHANGE.WORKSPACE,
            RABBITMQ_ROUTING_KEY.WORKSPACE_INVITATION_EXPIRED,
            RABBITMQ_QUEUE.AUDIT_WORKSPACE_INVITATION_EXPIRED,

            async (event) => {
                await createAuditLog({
                    user: {
                        connect: {
                            id: event.inviterId,
                        },
                    },

                    action: AUDIT_ACTION.WORKSPACE_INVITATION_EXPIRED,

                    resource: AUDIT_RESOURCE.WORKSPACE_INVITATION,

                    resourceId: event.invitationId,

                    metadata: {
                        invitationId: event.invitationId,
                        workspaceId: event.workspaceId,
                        inviteeId: event.inviteeId,
                        inviterId: event.inviterId,
                        previousStatus: event.previousStatus,
                        status: event.status,
                        updatedAt: event.updatedAt,
                        expiredAt: event.expiresAt,
                    },

                    ipAddress: event.ipAddress || null,
                }, this.auditRepository);

                console.log(`Audit log created for workspace invitation expiration: ${event.invitationId}`);
            },
        );
    }
}