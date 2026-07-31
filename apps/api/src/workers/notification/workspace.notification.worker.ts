import type { RedisPublisher } from '../../infrastructure/cache/publisher.ts';
import type { WorkspaceDeletedEvent } from '../../events/index.ts';
import { consumer } from '../../infrastructure/queue/index.ts';

import { NotificationRepository } from '../../modules/notification/index.ts';
import { NotificationType } from '@prisma/client';
import {
  RABBITMQ_QUEUE,
  RABBITMQ_EXCHANGE,
  RABBITMQ_ROUTING_KEY,
  REDIS_CHANNEL,
} from '../../common/constants/index.ts';

export class WorkspaceNotificationWorker {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly redisPublisher: RedisPublisher,
  ) {}

  async start() {
    // Consume workspace deleted events and create notifications
    await consumer.consume<WorkspaceDeletedEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_DELETED,
      RABBITMQ_QUEUE.NOTIFICATION_WORKSPACE_DELETED,

      async (event) => {
        await this.handleWorkspaceDeleted(event);

        console.log(`Notification created for workspace deletion: ${event.id}`);
      },
    );
  }

  private async handleWorkspaceDeleted(event: WorkspaceDeletedEvent) {
    for (const member of event.members) {
      const notification = await this.notificationRepository.create({
        user: {
          connect: {
            id: member.id,
          },
        },
        type: NotificationType.WARNING,
        title: 'Workspace Deleted',
        message: `The workspace "${event.workspaceName}" has been deleted by ${event.deletedBy}.`,
        data: {
          workspaceId: event.id,
          workspaceName: event.workspaceName,
          deletedBy: event.deletedBy,
          deletedAt: event.deletedAt,
        },
      });

      // Publish the notification to Redis
      await this.redisPublisher.publish(
        REDIS_CHANNEL.NOTIFICATION_CREATED,
        JSON.stringify(notification),
      );
    }
  }
}
