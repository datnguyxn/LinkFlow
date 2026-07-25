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

/**
 * NotificationWorker is responsible for consuming workspace invitation events and creating notifications.
 */
export class NotificationWorker {
  /**
   * Creates an instance of NotificationWorker.
   * @param notificationRepository - The repository for managing notifications in the database.
   * @param redisPublisher - The Redis publisher for publishing real-time events.
   */
  constructor(
    // Dependencies
    private readonly notificationRepository: NotificationRepository,
    private readonly redisPublisher: RedisPublisher,
  ) {}

  /**
   * Starts the NotificationWorker by consuming workspace invitation events and creating notifications.
   * This method sets up event consumers for workspace invitation creation, acceptance, rejection, and revocation.
   * It listens for events from the RabbitMQ exchange and routing keys, and processes them accordingly.
   */
  async start() {
    // Consume workspace invitation events and create notifications
    await consumer.consume<WorkspaceInvitationCreatedEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE, // Exchange for workspace-related events
      RABBITMQ_ROUTING_KEY.WORKSPACE_INVITATION_CREATED, // Routing key for workspace invitation created events
      RABBITMQ_QUEUE.NOTIFICATION_WORKSPACE_INVITATION_CREATED, // Queue for workspace invitation created events

      // Handle the workspace invitation created event
      async (event) => {
        await this.handleInvitationCreated(event);

        console.log(`Notification created for workspace invitation: ${event.invitationId}`);
      },
    );

    // Consume workspace invitation update events and create notifications
    await consumer.consume<WorkspaceInvitationUpdatedEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE, // Exchange for workspace-related events
      RABBITMQ_ROUTING_KEY.WORKSPACE_INVITATION_ACCEPTED, // Routing key for workspace invitation accepted events
      RABBITMQ_QUEUE.NOTIFICATION_WORKSPACE_INVITATION_ACCEPTED, // Queue for workspace invitation accepted events

      // Handle the workspace invitation accepted event
      async (event) => {
        await this.handleInvitationAccepted(event);

        console.log(`Notification updated for workspace invitation: ${event.invitationId}`);
      },
    );

    // Consume workspace invitation rejection events and create notifications
    await consumer.consume<WorkspaceInvitationUpdatedEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE, // Exchange for workspace-related events
      RABBITMQ_ROUTING_KEY.WORKSPACE_INVITATION_REJECTED, // Routing key for workspace invitation rejected events
      RABBITMQ_QUEUE.NOTIFICATION_WORKSPACE_INVITATION_REJECTED, // Queue for workspace invitation rejected events

      // Handle the workspace invitation rejected event
      async (event) => {
        await this.handleInvitationRejected(event);

        console.log(`Notification updated for workspace invitation: ${event.invitationId}`);
      },
    );

    // Consume workspace invitation revocation events and create notifications
    await consumer.consume<WorkspaceInvitationUpdatedEvent>(
      RABBITMQ_EXCHANGE.WORKSPACE, // Exchange for workspace-related events
      RABBITMQ_ROUTING_KEY.WORKSPACE_INVITATION_REVOKED, // Routing key for workspace invitation revoked events
      RABBITMQ_QUEUE.NOTIFICATION_WORKSPACE_INVITATION_REVOKED, // Queue for workspace invitation revoked events

      // Handle the workspace invitation revoked event
      async (event) => {
        await this.handleInvitationRevoked(event);

        console.log(`Notification updated for workspace invitation: ${event.invitationId}`);
      },
    );

    console.log('✅ Notification worker started');
  }

  /**
   * Handles the workspace invitation created event by creating a notification in the database and publishing a real-time event.
   * @param event - The workspace invitation created event containing relevant information.
   */
  async handleInvitationCreated(event: WorkspaceInvitationCreatedEvent) {
    // 1. Create notification in database
    const notification = await this.notificationRepository.create({
      user: {
        connect: {
          id: event.inviteeId, // Connect the notification to the invitee user
        },
      },

      type: NotificationType.WORKSPACE_INVITATION, // Set the notification type to workspace invitation

      title: 'Workspace Invitation', // Set the notification title to "Workspace Invitation"

      message: `${event.inviterName} invited you to ${event.workspaceName}`, // Set the notification message to indicate that the inviter has invited the invitee to the workspace

      data: {
        invitationId: event.invitationId, // Include the invitation ID in the notification data
        workspaceId: event.workspaceId, // Include the workspace ID in the notification data
        workspaceName: event.workspaceName, // Include the workspace name in the notification data
        inviterId: event.inviterId, // Include the inviter's ID in the notification data
        inviterName: event.inviterName, // Include the inviter's name in the notification data
        roleId: event.roleId, // Include the role ID in the notification data
        roleName: event.roleName, // Include the role name in the notification data
      },
    });

    // 2. Publish realtime event
    await this.redisPublisher.publish(REDIS_CHANNEL.NOTIFICATION_CREATED, {
      userId: event.inviteeId, // Publish the notification to the invitee user

      notification, // Include the created notification in the published event
    });

    console.log(
      `Notification created and published for workspace invitation: ${event.invitationId}`,
    );
  }

  /**
   * Handles the workspace invitation accepted event by creating a notification in the database and publishing a real-time event.
   * @param event - The workspace invitation accepted event containing relevant information.
   */
  async handleInvitationAccepted(event: WorkspaceInvitationUpdatedEvent) {
    // 1. Create notification in database
    const notification = await this.notificationRepository.create({
      user: {
        connect: {
          id: event.inviterId, // Connect the notification to the inviter user
        },
      },

      type: NotificationType.WORKSPACE_INVITATION, // Set the notification type to workspace invitation

      title: 'Workspace Invitation Accepted', // Set the notification title to "Workspace Invitation Accepted"

      message: `${event.inviteeName} has accepted your invitation to ${event.workspaceName}`, // Set the notification message to indicate that the invitee has accepted the invitation to the workspace

      data: {
        invitationId: event.invitationId, // Include the invitation ID in the notification data
        workspaceId: event.workspaceId, // Include the workspace ID in the notification data
        workspaceName: event.workspaceName, // Include the workspace name in the notification data
        inviterId: event.inviterId, // Include the inviter's ID in the notification data
        inviterName: event.inviterName, // Include the inviter's name in the notification data
        inviteeId: event.inviteeId, // Include the invitee's ID in the notification data
        inviteeName: event.inviteeName, // Include the invitee's name in the notification data
        previousStatus: event.previousStatus, // Include the previous status of the invitation in the notification data
        status: event.status, // Include the current status of the invitation in the notification data
        roleName: event.roleName, // Include the role name associated with the invitation in the notification data
        acceptedAt: event.acceptedAt, // Include the timestamp when the invitation was accepted in the notification data
        updatedAt: event.updatedAt, // Include the timestamp when the invitation was last updated in the notification data
      },
    });

    // 2. Publish realtime event
    await this.redisPublisher.publish(REDIS_CHANNEL.NOTIFICATION_CREATED, {
      userId: event.inviterId, // Publish the notification to the inviter user

      notification, // Include the created notification in the published event
    });

    console.log(
      `Notification created and published for workspace invitation update: ${event.invitationId}`,
    );
  }

  /**
   * Handles the workspace invitation rejected event by creating a notification in the database and publishing a real-time event.
   * @param event - The workspace invitation rejected event containing relevant information.
   */
  async handleInvitationRejected(event: WorkspaceInvitationUpdatedEvent) {
    // 1. Create notification in database
    const notification = await this.notificationRepository.create({
      user: {
        connect: {
          id: event.inviterId, // Connect the notification to the inviter user
        },
      },

      type: NotificationType.WORKSPACE_INVITATION, // Set the notification type to workspace invitation

      title: 'Workspace Invitation Rejected', // Set the notification title to "Workspace Invitation Rejected"

      message: `${event.inviteeName} has rejected your invitation to ${event.workspaceName}`, // Set the notification message to indicate that the invitee has rejected the invitation to the workspace

      data: {
        invitationId: event.invitationId, // Include the invitation ID in the notification data
        workspaceId: event.workspaceId, // Include the workspace ID in the notification data
        workspaceName: event.workspaceName, // Include the workspace name in the notification data
        inviterId: event.inviterId, // Include the inviter's ID in the notification data
        inviterName: event.inviterName, // Include the inviter's name in the notification data
        inviteeId: event.inviteeId, // Include the invitee's ID in the notification data
        inviteeName: event.inviteeName, // Include the invitee's name in the notification data
        previousStatus: event.previousStatus, // Include the previous status of the invitation in the notification data
        status: event.status, // Include the current status of the invitation in the notification data
        roleName: event.roleName, // Include the role name associated with the invitation in the notification data
        rejectedAt: event.rejectedAt, // Include the timestamp when the invitation was rejected in the notification data
        updatedAt: event.updatedAt, // Include the timestamp when the invitation was last updated in the notification data
      },
    });

    // 2. Publish realtime event
    await this.redisPublisher.publish(REDIS_CHANNEL.NOTIFICATION_CREATED, {
      userId: event.inviterId, // Publish the notification to the inviter user

      notification, // Include the created notification in the published event
    });

    console.log(
      `Notification created and published for workspace invitation update: ${event.invitationId}`,
    );
  }

  /**
   * Handles the workspace invitation revoked event by creating a notification in the database and publishing a real-time event.
   * @param event - The workspace invitation revoked event containing relevant information.
   */
  async handleInvitationRevoked(event: WorkspaceInvitationUpdatedEvent) {
    // 1. Create notification in database
    const notification = await this.notificationRepository.create({
      user: {
        connect: {
          id: event.inviterId, // Connect the notification to the inviter user
        },
      },

      type: NotificationType.WORKSPACE_INVITATION, // Set the notification type to workspace invitation

      title: 'Workspace Invitation Revoked', // Set the notification title to "Workspace Invitation Revoked"

      message: `${event.inviterName} has revoked your invitation to ${event.workspaceName}`, // Set the notification message to indicate that the inviter has revoked the invitation to the workspace

      data: {
        invitationId: event.invitationId, // Include the invitation ID in the notification data
        workspaceId: event.workspaceId, // Include the workspace ID in the notification data
        workspaceName: event.workspaceName, // Include the workspace name in the notification data
        inviterId: event.inviterId, // Include the inviter's ID in the notification data
        inviterName: event.inviterName, // Include the inviter's name in the notification data
        previousStatus: event.previousStatus, // Include the previous status of the invitation in the notification data
        status: event.status, // Include the current status of the invitation in the notification data
        roleName: event.roleName, // Include the role name associated with the invitation in the notification data
        revokedAt: event.revokedAt, // Include the timestamp when the invitation was revoked in the notification data
        updatedAt: event.updatedAt, // Include the timestamp when the invitation was last updated in the notification data
      },
    });

    // 2. Publish realtime event
    await this.redisPublisher.publish(REDIS_CHANNEL.NOTIFICATION_CREATED, {
      userId: event.inviteeId, // Publish the notification to the invitee user

      notification, // Include the created notification in the published event
    });

    console.log(
      `Notification created and published for workspace invitation update: ${event.invitationId}`,
    );
  }
}
