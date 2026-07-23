import type { RedisPublisher } from '../../infrastructure/cache/publisher.ts';
import type {
  WorkspaceInvitationCreatedEvent,
  WorkspaceInvitationUpdatedEvent,
} from '../../events/index.ts';
import { consumer } from '../../infrastructure/queue/index.ts';

import { NotificationRepository } from '../../modules/notification/index.ts';
import { NotificationType } from '@prisma/client';
import {
  RABBITMQ_QUEUE,
  RABBITMQ_EXCHANGE,
  RABBITMQ_ROUTING_KEY,
  REDIS_CHANNEL,
} from '../../common/constants/index.ts';

export class NotificationWorker {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly redisPublisher: RedisPublisher,
  ) {}

  async start() {
    // Consume workspace invitation created events and create notifications
    await consumer.consume<WorkspaceInvitationCreatedEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_INVITATION_CREATED,
      RABBITMQ_QUEUE.NOTIFICATION_WORKSPACE_INVITATION_CREATED,

      async (event) => {
        await this.handleInvitationCreated(event);

        console.log(`Notification created for workspace invitation: ${event.invitationId}`);
      },
    );
  }

  async handleInvitationCreated(event: WorkspaceInvitationCreatedEvent) {
    // 1. Create notification in database
    const notification = await this.notificationRepository.create({
      user: {
        connect: {
          id: event.inviteeId,
        },
      },

      type: NotificationType.WORKSPACE_INVITATION,

      title: 'Workspace Invitation',

      message: `${event.inviterName} invited you to ${event.workspaceName}`,

      data: {
        invitationId: event.invitationId,
        workspaceId: event.workspaceId,
        workspaceName: event.workspaceName,
        inviterId: event.inviterId,
        inviterName: event.inviterName,
        roleId: event.roleId,
        roleName: event.roleName,
      },
    });

    // 2. Publish realtime event
    await this.redisPublisher.publish(REDIS_CHANNEL.NOTIFICATION_CREATED, {
      userId: event.inviterId,

      notification,
    });

    console.log(
      `Notification created and published for workspace invitation: ${event.invitationId}`,
    );
  }

  async handleInvitationUpdated(event: WorkspaceInvitationUpdatedEvent) {
    // 1. Create notification in database
    const notification = await this.notificationRepository.create({
      user: {
        connect: {
          id: event.inviterId,
        },
      },

      type: NotificationType.WORKSPACE_INVITATION,

      title: 'Workspace Invitation Updated',

      message: `${event.inviterName} has accepted your invitation to ${event.workspaceName}`,

      data: {
        invitationId: event.invitationId,
        workspaceId: event.workspaceId,
        workspaceName: event.workspaceName,
        inviterId: event.inviterId,
        inviterName: event.inviterName,
        previousStatus: event.previousStatus,
        status: event.status,
        roleName: event.roleName,
        acceptedAt: event.acceptedAt,
      },
    });

    await this.redisPublisher.publish(REDIS_CHANNEL.NOTIFICATION_UPDATED, {
      userId: event.inviterId,

      notification,
    });

    console.log(
      `Notification created and published for workspace invitation update: ${event.invitationId}`,
    );
  }
}
