import type { MailService } from '../../infrastructure/mail/interfaces/mail.service.ts';
import { consumer } from '../../infrastructure/queue/index.ts';
import {
  RABBITMQ_EXCHANGE,
  RABBITMQ_QUEUE,
  RABBITMQ_ROUTING_KEY,
} from '../../common/constants/rabbitmq.constant.ts';

import type { WorkspaceDeletedEvent } from '../../events/index.ts';

export class WorkspaceEmailWorker {
  constructor(
    private readonly mailService: MailService,
  ) {}

  async start() {
    await consumer.consume<WorkspaceDeletedEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_DELETED,
      RABBITMQ_QUEUE.EMAIL_WORKSPACE_DELETED,

      async (event) => {
        try {
          await Promise.all(
            event.members.map((member) =>
              this.mailService.sendWorkspaceDeletedEmail({
                workspaceId: event.id,
                memberId: member.id,
                memberName: member.name || member.email,
                memberEmail: member.email,
                workspaceName: event.workspaceName || 'Unknown Workspace',
                ownerName: event.deletedBy,
                deletedAt: event.deletedAt,
                ipAddress: event.ipAddress ?? null,
              }),
            ),
          );

          console.log(
            `Workspace deleted emails sent for workspace ${event.workspaceName} (${event.id})`,
          );
        } catch (error) {
          console.error(
            `Failed to send workspace deleted emails for workspace ${event.id}`,
            error,
          );
        }
      },
    );
  }
}