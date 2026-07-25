import { AuditLogRepository } from '../../modules/audit-log/repository/audit-log.repository.ts';
import { consumer } from '../../infrastructure/queue/index.ts';
import {
  RABBITMQ_EXCHANGE,
  RABBITMQ_QUEUE,
  RABBITMQ_ROUTING_KEY,
} from '../../common/constants/index.ts';
import { AUDIT_ACTION, AUDIT_RESOURCE } from '../../common/constants/audit.constant.ts';

import type {
  WorkspaceOwnershipTransferredEvent,
  WorkspaceMemberRoleUpdatedEvent,
  WorkspaceMemberLeaveEvent,
  WorkspaceMemberRemoveEvent,
} from '../../events/index.ts';
import { createAuditLog } from '../../utils/create-audit.util.ts';

export class WorkspaceMemberAuditWorker {
  constructor(private readonly auditRepository: AuditLogRepository) {}

  async start() {
    // Consume workspace ownership transferred events and create audit logs
    await consumer.consume<WorkspaceOwnershipTransferredEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_OWNERSHIP_TRANSFERRED,
      RABBITMQ_QUEUE.AUDIT_WORKSPACE_OWNERSHIP_TRANSFERRED,

      async (event) => {
        await createAuditLog(
          {
            user: {
              connect: {
                id: event.newOwner.userId,
              },
            },

            action: AUDIT_ACTION.WORKSPACE_OWNERSHIP_TRANSFERRED,

            resource: AUDIT_RESOURCE.WORKSPACE_MEMBER,

            resourceId: event.workspaceId,

            metadata: {
              previousOwnerId: event.previousOwner.userId,
              newOwnerId: event.newOwner.userId,
              transferredAt: event.transferredAt,
            },

            ipAddress: event.ipAddress || null,
          },
          this.auditRepository,
        );

        console.log(`Audit log created for workspace ownership transfer: ${event.workspaceId}`);
      },
    );

    await consumer.consume<WorkspaceMemberRoleUpdatedEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_MEMBER_ROLE_UPDATED,
      RABBITMQ_QUEUE.AUDIT_WORKSPACE_MEMBER_ROLE_UPDATED,

      async (event) => {
        await createAuditLog(
          {
            user: {
              connect: {
                id: event.userId,
              },
            },

            action: AUDIT_ACTION.WORKSPACE_MEMBER_ROLE_UPDATED,

            resource: AUDIT_RESOURCE.WORKSPACE_MEMBER,

            resourceId: event.memberId,

            metadata: {
              memberId: event.memberId,
              previousRoleId: event.previousRoleId,
              newRoleId: event.newRoleId,
              updatedAt: event.updatedAt,
            },

            ipAddress: event.ipAddress || null,
          },
          this.auditRepository,
        );

        console.log(`Audit log created for workspace member role update: ${event.workspaceId}`);
      },
    );

    await consumer.consume<WorkspaceMemberLeaveEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_MEMBER_LEAVE,
      RABBITMQ_QUEUE.AUDIT_WORKSPACE_MEMBER_LEAVE,

      async (event) => {
        await createAuditLog(
          {
            user: {
              connect: {
                id: event.userId,
              },
            },

            action: AUDIT_ACTION.WORKSPACE_MEMBER_LEAVE,

            resource: AUDIT_RESOURCE.WORKSPACE_MEMBER,

            resourceId: event.memberId,

            metadata: {
              email: event.email,
              fullName: event.fullName,
              role: event.role,
              deleteAt: event.deleteAt || null,
            },

            ipAddress: event.ipAddress || null,
          },
          this.auditRepository,
        );

        console.log(`Audit log created for workspace member leave: ${event.memberId}`);
      },
    );

    await consumer.consume<WorkspaceMemberRemoveEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_MEMBER_REMOVE,
      RABBITMQ_QUEUE.AUDIT_WORKSPACE_MEMBER_REMOVE,

      async (event) => {
        await createAuditLog(
          {
            user: {
              connect: {
                id: event.userId,
              },
            },

            action: AUDIT_ACTION.WORKSPACE_MEMBER_REMOVE,

            resource: AUDIT_RESOURCE.WORKSPACE_MEMBER,

            resourceId: event.memberId,

            metadata: {
              email: event.email,
              fullName: event.fullName,
              role: event.role,
              deleteAt: event.deleteAt || null,
            },

            ipAddress: event.ipAddress || null,
          },
          this.auditRepository,
        );

        console.log(`Audit log created for workspace member remove: ${event.memberId}`);
      },
    );
  }
}
