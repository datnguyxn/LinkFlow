import type { MailService } from '../../infrastructure/mail/interfaces/mail.service.ts';
import { consumer } from '../../infrastructure/queue/index.ts';
import {
  RABBITMQ_EXCHANGE,
  RABBITMQ_QUEUE,
  RABBITMQ_ROUTING_KEY,
} from '../../common/constants/rabbitmq.constant.ts';

import type {
  WorkspaceOwnershipTransferredEvent,
  WorkspaceMemberRoleUpdatedEvent,
  WorkspaceMemberLeaveEvent,
} from '../../events/index.ts';

export class WorkspaceMemberEmailWorker {
  constructor(private readonly mailService: MailService) {}

  async start() {
    // Consume workspace ownership transferred events and send emails
    await consumer.consume<WorkspaceOwnershipTransferredEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_OWNERSHIP_TRANSFERRED,
      RABBITMQ_QUEUE.EMAIL_WORKSPACE_OWNERSHIP_TRANSFERRED,

      async (event) => {
        try {
          await this.handleOwnershipTransferred(event);

          console.log(
            `Workspace ownership transferred email sent to ${event.newOwner.email} and ${event.previousOwner.email}`,
          );
        } catch (error) {
          console.error('Error sending workspace ownership transferred email:', error);
        }
      },
    );

    await consumer.consume<WorkspaceMemberRoleUpdatedEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_MEMBER_ROLE_UPDATED,
      RABBITMQ_QUEUE.EMAIL_WORKSPACE_MEMBER_ROLE_UPDATED,

      async (event) => {
        try {
          await this.mailService.sendWorkspaceMemberRoleUpdatedEmail({
            workspaceId: event.workspaceId,
            workspaceName: event.workspaceName,
            slug: event.slug,
            memberId: event.memberId,
            userId: event.userId,
            memberName: event.memberName,
            memberEmail: event.memberEmail,
            previousRoleId: event.previousRoleId,
            previousRoleName: event.previousRoleName,
            newRoleId: event.newRoleId,
            newRoleName: event.newRoleName,
            updatedAt: event.updatedAt,
            ipAddress: event.ipAddress || null,
          });

          console.log(`Workspace member role updated email sent to ${event.memberEmail}`);
        } catch (error) {
          console.error('Error sending workspace member role updated email:', error);
        }
      },
    );

    await consumer.consume<WorkspaceMemberLeaveEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_MEMBER_LEAVE,
      RABBITMQ_QUEUE.EMAIL_WORKSPACE_MEMBER_LEAVE,

      async (event) => {
        try {
          await this.mailService.sendWorkspaceMemberLeaveEmail({
            workspaceId: event.workspaceId,
            workspaceName: event.workspaceName,
            ownerName: event.ownerName,
            memberId: event.memberId,
            ownerEmail: event.ownerEmail,
            memberName: event.fullName,
            role: event.role,
            leaveAt: event.deleteAt || new Date(),
            ipAddress: event.ipAddress || null,
          });

          console.log(`Workspace member leave email sent to ${event.ownerEmail}`);
        } catch (error) {
          console.error('Error sending workspace member leave email:', error);
        }
      },
    );

    await consumer.consume<WorkspaceMemberLeaveEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_MEMBER_REMOVE,
      RABBITMQ_QUEUE.EMAIL_WORKSPACE_MEMBER_REMOVE,

      async (event) => {
        try {
          await this.mailService.sendWorkspaceMemberRemovedEmail({
            workspaceId: event.workspaceId,
            workspaceName: event.workspaceName,
            memberId: event.memberId,
            userId: event.userId,
            memberEmail: event.email,
            fullName: event.fullName,
            role: event.role,
            removeAt: event.deleteAt || new Date(),
          });

          console.log(`Workspace member removed email sent to ${event.email}`);
        } catch (error) {
          console.error('Error sending workspace member removed email:', error);
        }
      },
    );
  }

  private async handleOwnershipTransferred(event: WorkspaceOwnershipTransferredEvent) {
    await Promise.all([
      this.mailService.sendOwnershipTransferredToNewOwner({
        email: event.newOwner.email,
        name: event.newOwner.name,
        workspaceName: event.workspaceName,
      }),

      this.mailService.sendOwnershipTransferredToPreviousOwner({
        email: event.previousOwner.email,
        name: event.previousOwner.name,
        workspaceName: event.workspaceName,
      }),
    ]);
  }
}
