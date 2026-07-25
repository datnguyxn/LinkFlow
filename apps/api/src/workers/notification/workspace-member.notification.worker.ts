import type { RedisPublisher } from '../../infrastructure/cache/publisher.ts';
import type {
  WorkspaceMemberRoleUpdatedEvent,
  WorkspaceOwnershipTransferredEvent,
  WorkspaceMemberLeaveEvent,
  WorkspaceMemberRemoveEvent,
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

export class WorkspaceMemberNotificationWorker {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly redisPublisher: RedisPublisher,
  ) {}

  async start() {
    // Consume workspace ownership transferred events and create notifications
    await consumer.consume<WorkspaceOwnershipTransferredEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_OWNERSHIP_TRANSFERRED,
      RABBITMQ_QUEUE.NOTIFICATION_WORKSPACE_OWNERSHIP_TRANSFERRED,

      async (event) => {
        await this.handleOwnershipTransferred(event);

        console.log(`Notification created for workspace ownership transfer: ${event.workspaceId}`);
      },
    );

    await consumer.consume<WorkspaceMemberRoleUpdatedEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_MEMBER_ROLE_UPDATED,
      RABBITMQ_QUEUE.NOTIFICATION_WORKSPACE_MEMBER_ROLE_UPDATED,

      async (event) => {
        await this.handleRoleUpdated(event);

        console.log(`Notification created for workspace member role update: ${event.workspaceId}`);
      },
    );

    await consumer.consume<WorkspaceMemberLeaveEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_MEMBER_LEAVE,
      RABBITMQ_QUEUE.NOTIFICATION_WORKSPACE_MEMBER_LEAVE,

      async (event) => {
        const notification = await this.notificationRepository.create({
          user: {
            connect: {
              id: event.ownerId,
            },
          },
          type: NotificationType.INFO,

          title: 'Workspace Member Left',

          message: `A member has left the workspace "${event.workspaceName}".`,

          data: {
            workspaceId: event.workspaceId,
            ownerName: event.ownerName,
            memberId: event.memberId,
          },
        });

        // Publish the notification to Redis for real-time updates
        await this.redisPublisher.publish(REDIS_CHANNEL.NOTIFICATION_CREATED, {
          userId: event.ownerId,
          notification,
        });

        console.log(`Notification created for workspace member leave: ${event.workspaceId}`);
      },
    );

    await consumer.consume<WorkspaceMemberRemoveEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_MEMBER_REMOVE,
      RABBITMQ_QUEUE.NOTIFICATION_WORKSPACE_MEMBER_REMOVE,

      async (event) => {
        const notification = await this.notificationRepository.create({
          user: {
            connect: {
              id: event.userId,
            },
          },
          type: NotificationType.INFO,

          title: 'Workspace Member Removed',

          message: `You have been removed from the workspace "${event.workspaceName}".`,

          data: {
            workspaceId: event.workspaceId,
            ownerName: event.ownerName,
            memberId: event.memberId,
            removeAt: event.deleteAt || null,
          },
        });

        // Publish the notification to Redis for real-time updates
        await this.redisPublisher.publish(REDIS_CHANNEL.NOTIFICATION_CREATED, {
          userId: event.userId,
          notification,
        });

        console.log(`Notification created for workspace member removal: ${event.workspaceId}`);
      },
    );
  }

  private async handleOwnershipTransferred(event: WorkspaceOwnershipTransferredEvent) {
    // Create notifications for both the new owner and the previous owner
    const notifications = [
      {
        userId: event.newOwner.userId,
        type: NotificationType.SUCCESS,
        title: 'Workspace Ownership Transferred',
        message: `You are now the owner of the workspace "${event.workspaceName}".`,
        data: {
          workspaceId: event.workspaceId,
          previousOwnerId: event.previousOwner.userId,
        },
      },
      {
        userId: event.previousOwner.userId,
        type: NotificationType.SUCCESS,
        title: 'Workspace Ownership Transferred',
        message: `You have transferred ownership of the workspace "${event.workspaceName}" to ${event.newOwner.name}.`,
        data: {
          workspaceId: event.workspaceId,
          newOwnerId: event.newOwner.userId,
        },
      },
    ];

    // Save notifications to the database
    await this.notificationRepository.createMany(notifications);

    // Publish notifications to Redis for real-time updates
    for (const notification of notifications) {
      await this.redisPublisher.publish(REDIS_CHANNEL.NOTIFICATION_CREATED, {
        userId: notification.userId,
        notification,
      });
    }
  }

  private async handleRoleUpdated(event: WorkspaceMemberRoleUpdatedEvent) {
    const notification = await this.notificationRepository.create({
      user: {
        connect: {
          id: event.userId,
        },
      },
      type: NotificationType.INFO,

      title: 'Workspace Member Role Updated',

      message: `Your role in the workspace "${event.workspaceName}" has been updated.`,

      data: {
        workspaceId: event.workspaceId,
        previousRoleId: event.previousRoleId,
        newRoleId: event.newRoleId,
      },
    });

    // Publish the notification to Redis for real-time updates
    await this.redisPublisher.publish(REDIS_CHANNEL.NOTIFICATION_CREATED, {
      userId: event.userId,
      notification,
    });
  }
}
