import type { MailService } from '../../infrastructure/mail/interfaces/mail.service.ts';
import { consumer } from '../../infrastructure/queue/index.ts';
import {
  RABBITMQ_EXCHANGE,
  RABBITMQ_QUEUE,
  RABBITMQ_ROUTING_KEY,
} from '../../common/constants/rabbitmq.constant.ts';

import type {
  WorkspaceInvitationCreatedEvent,
  WorkspaceInvitationUpdatedEvent,
} from '../../events/index.ts';

/**
 * WorkspaceInvitationMailWorker is responsible for consuming workspace invitation events from RabbitMQ and sending corresponding emails using the MailService.
 * It listens to events such as workspace invitation creation, acceptance, rejection, and revocation, and sends appropriate emails accordingly.
 *
 * The worker uses the MailService to send emails, and it subscribes to specific RabbitMQ exchanges and queues for each event type.
 */
export class WorkspaceInvitationMailWorker {
  constructor(private readonly mailService: MailService) {}

  /**
   * Start the WorkspaceInvitationMailWorker to consume events from RabbitMQ and send emails.
   */
  async start() {
    // Consume workspace invitation created events and send invitation emails
    await consumer.consume<WorkspaceInvitationCreatedEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_INVITATION_CREATED,
      RABBITMQ_QUEUE.EMAIL_WORKSPACE_INVITATION_CREATED,

      async (event) => {
        try {
          await this.mailService.sendWorkspaceInvitationEmail({
            workspaceId: event.workspaceId,
            name: event.inviteeName || '',
            email: event.inviteeEmail || '',
            inviterName: event.inviterName,
            workspaceName: event.workspaceName,
            inviteToken: event.token,
            roleName: event.roleName,
          });

          console.log(`Workspace invitation email sent to ${event.inviteeEmail || ''}`);
        } catch (error) {
          console.error('Error sending workspace invitation email:', error);
        }
      },
    );

    await consumer.consume<WorkspaceInvitationUpdatedEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_INVITATION_ACCEPTED,
      RABBITMQ_QUEUE.EMAIL_WORKSPACE_INVITATION_ACCEPTED,

      async (event) => {
        try {
          await this.handleAccepted(event);
        } catch (error) {
          console.error('Error sending workspace invitation accepted email:', error);
        }
      },
    );

    await consumer.consume<WorkspaceInvitationUpdatedEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_INVITATION_REJECTED,
      RABBITMQ_QUEUE.EMAIL_WORKSPACE_INVITATION_REJECTED,

      async (event) => {
        try {
          await this.handleRejected(event);

          console.log(`Workspace invitation rejected email sent to ${event.inviterEmail || ''}`);
        } catch (error) {
          console.error('Error sending workspace invitation rejected email:', error);
        }
      },
    );

    await consumer.consume<WorkspaceInvitationUpdatedEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_INVITATION_REVOKED,
      RABBITMQ_QUEUE.EMAIL_WORKSPACE_INVITATION_REVOKED,

      async (event) => {
        try {
          await this.handleRevoked(event);

          console.log(`Workspace invitation revoked email sent to ${event.inviteeEmail || ''}`);
        } catch (error) {
          console.error('Error sending workspace invitation revoked email:', error);
        }
      },
    );
  }

  private async handleAccepted(event: WorkspaceInvitationUpdatedEvent) {
    await Promise.all([
      this.mailService.sendAcceptanceEmailToInviter({
        workspaceId: event.workspaceId,
        name: event.inviterName,
        email: event.inviterEmail,
        inviterName: event.inviterName,
        inviteeName: event.inviteeName,
        workspaceName: event.workspaceName,
        inviteToken: '', // No token needed for acceptance email
        roleName: event.roleName,
      }),
      console.log(
        `Acceptance email sent to inviter ${event.inviterName} (${event.inviterEmail}) for invitation ${event.invitationId}`,
      ),

      this.mailService.sendAcceptanceEmailToInvitee({
        workspaceId: event.workspaceId,
        name: event.inviteeName,
        email: event.inviteeEmail,
        inviterName: event.inviterName,
        inviteeName: event.inviteeName,
        workspaceName: event.workspaceName,
        inviteToken: '', // No token needed for acceptance email
        roleName: event.roleName,
      }),

      console.log(
        `Acceptance email sent to invitee ${event.inviteeName} (${event.inviteeEmail}) for invitation ${event.invitationId}`,
      ),
    ]);
  }

  private async handleRejected(event: WorkspaceInvitationUpdatedEvent) {
    await Promise.all([
      this.mailService.sendRejectionEmailToInviter({
        workspaceId: event.workspaceId,
        name: event.inviterName,
        email: event.inviterEmail,
        inviterName: event.inviterName,
        inviteeName: event.inviteeName,
        workspaceName: event.workspaceName,
        roleName: event.roleName,
      }),
      console.log(
        `Rejection email sent to inviter ${event.inviterName} (${event.inviterEmail}) for invitation ${event.invitationId}`,
      ),
    ]);
  }

  private async handleRevoked(event: WorkspaceInvitationUpdatedEvent) {
    await Promise.all([
      this.mailService.sendRevocationEmailToInvitee({
        workspaceId: event.workspaceId,
        name: event.inviteeName,
        email: event.inviteeEmail,
        inviterName: event.inviterName,
        inviteeName: event.inviteeName,
        workspaceName: event.workspaceName,
        roleName: event.roleName,
      }),
      console.log(
        `Revocation email sent to invitee ${event.inviteeName} (${event.inviteeEmail}) for invitation ${event.invitationId}`,
      ),
    ]);
  }
}
