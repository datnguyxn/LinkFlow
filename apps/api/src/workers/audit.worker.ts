import { AuditLogRepository } from '../modules/audit-log/repository/audit-log.repository.ts';
import { consumer } from '../infrastructure/queue/index.ts';
import {
  RABBITMQ_EXCHANGE,
  RABBITMQ_QUEUE,
  RABBITMQ_ROUTING_KEY,
} from '../common/constants/index.ts';
import { AUDIT_ACTION, AUDIT_RESOURCE } from '../common/constants/audit.constant.ts';

import type {
  UserRegisteredEvent,
  UserLoginEvent,
  UserLogoutEvent,
  PasswordResetRequestedEvent,
  AuthAuditEvent,
} from '../events/index.ts';

import type { UserActionEvent } from '../events/index.ts';
import type { Prisma } from '@prisma/client';

/**
 * AuditWorker is responsible for consuming audit-related events from RabbitMQ and creating corresponding audit logs in the database.
 * It listens to events such as user registration, login, logout, and admin actions, and records them in the audit log repository.
 *
 * The worker uses the AuditLogRepository to persist audit logs, and it subscribes to specific RabbitMQ exchanges and queues for each event type.
 */
export class AuditWorker {
  // Initialize the AuditWorker with an instance of AuditLogRepository
  constructor(private readonly auditRepository: AuditLogRepository) {}

  /**
   * Start the AuditWorker to consume events from RabbitMQ and create audit logs.
   * This method sets up consumers for user registration, login, logout, and admin action events.
   * Each consumer listens to a specific exchange, routing key, and queue, and processes incoming events to create audit logs.
   */
  async start() {
    // Consume user registration events and create audit logs
    await consumer.consume<UserRegisteredEvent>(
      RABBITMQ_EXCHANGE.AUTH,
      RABBITMQ_ROUTING_KEY.USER_REGISTERED,
      RABBITMQ_QUEUE.AUDIT_USER_REGISTERED,

      // Process the user registration event and create an audit log entry
      async (event) => {
        await this.createAuditLog({
          user: {
            connect: {
              id: event.userId,
            },
          },

          action: AUDIT_ACTION.USER_REGISTERED,

          resource: AUDIT_RESOURCE.USER,

          resourceId: event.userId,

          metadata: {
            email: event.email,
            fullName: event.fullName,
          },

          ipAddress: event.ipAddress,
        });

        console.log(`Audit log created for user registration: ${event.email}`);
      },
    );

    // Consume user login events and create audit logs
    await consumer.consume<UserLoginEvent>(
      RABBITMQ_EXCHANGE.AUTH,
      RABBITMQ_ROUTING_KEY.USER_LOGIN,
      RABBITMQ_QUEUE.AUDIT_USER_LOGIN,

      // Process the user login event and create an audit log entry
      async (event) => {
        await this.createAuditLog({
          user: {
            connect: {
              id: event.userId,
            },
          },

          action: AUDIT_ACTION.USER_LOGIN,

          resource: AUDIT_RESOURCE.USER,

          resourceId: event.userId,

          metadata: {
            email: event.email,
            fullName: event.fullName,
            method: 'password', // Assuming login method is password for this example
          },

          ipAddress: event.ipAddress,
        });

        console.log(`Audit log created for user login: ${event.email}`);
      },
    );

    // Consume user logout events and create audit logs
    await consumer.consume<UserLogoutEvent>(
      RABBITMQ_EXCHANGE.AUTH,
      RABBITMQ_ROUTING_KEY.USER_LOGOUT,
      RABBITMQ_QUEUE.AUDIT_USER_LOGOUT,

      // Process the user logout event and create an audit log entry
      async (event) => {
        await this.createAuditLog({
          user: {
            connect: {
              id: event.userId,
            },
          },

          action: AUDIT_ACTION.USER_LOGOUT,

          resource: AUDIT_RESOURCE.USER,

          resourceId: event.userId,

          metadata: {},

          ipAddress: event.ipAddress,
        });

        console.log(`Audit log created for user logout: ${event.userId}`);
      },
    );

    // Consume admin user action events and create audit logs
    await consumer.consume<UserActionEvent>(
      RABBITMQ_EXCHANGE.ADMIN_USER,
      RABBITMQ_ROUTING_KEY.USER_ACTION,
      RABBITMQ_QUEUE.AUDIT_USER_ACTION,

      // Process the admin user action event and create an audit log entry
      async (event) => {
        await this.createAuditLog({
          user: {
            connect: {
              id: event.adminId,
            },
          },

          action: event.action,

          resource: AUDIT_RESOURCE.ADMIN,

          resourceId: event.targetUserId,

          metadata: {
            reason: event.reason || 'No reason provided',
            changes: event.changes || {},
            ...(event.metadata || {}),
          },

          ipAddress: event.ipAddress || null, // Admin actions may not have an IP address
        });

        console.log(
          `Audit log created for admin user action: ${event.action} on user ${event.targetUserId}`,
        );
      },
    );

    // Consume email verified events and create audit logs
    await consumer.consume<AuthAuditEvent>(
      RABBITMQ_EXCHANGE.AUTH,
      RABBITMQ_ROUTING_KEY.EMAIL_VERIFIED,
      RABBITMQ_QUEUE.AUDIT_EMAIL_VERIFIED,
      async (event) => {
        await this.createAuditLog({
          user: {
            connect: {
              id: event.userId,
            },
          },
          action: AUDIT_ACTION.EMAIL_VERIFIED,
          resource: AUDIT_RESOURCE.USER,
          resourceId: event.userId,
          metadata: {
            email: event.email,
            fullName: event.fullName,
          },
          ipAddress: event.ipAddress,
        });
      },
    );

    // Consume verification email resent events and create audit logs
    await consumer.consume<AuthAuditEvent>(
      RABBITMQ_EXCHANGE.AUTH,
      RABBITMQ_ROUTING_KEY.VERIFICATION_EMAIL_RESENT,
      RABBITMQ_QUEUE.AUDIT_VERIFICATION_EMAIL_RESENT,
      async (event) => {
        await this.createAuditLog({
          user: {
            connect: {
              id: event.userId,
            },
          },
          action: AUDIT_ACTION.VERIFICATION_EMAIL_RESENT,
          resource: AUDIT_RESOURCE.USER,
          resourceId: event.userId,
          metadata: {
            email: event.email,
            fullName: event.fullName,
          },
          ipAddress: event.ipAddress,
        });
      },
    );

    // Consume password reset requested events and create audit logs
    await consumer.consume<PasswordResetRequestedEvent>(
      RABBITMQ_EXCHANGE.AUTH,
      RABBITMQ_ROUTING_KEY.PASSWORD_RESET_REQUESTED,
      RABBITMQ_QUEUE.AUDIT_PASSWORD_RESET_REQUESTED,
      async (event) => {
        await this.createAuditLog({
          user: {
            connect: {
              id: event.userId,
            },
          },
          action: AUDIT_ACTION.PASSWORD_RESET_REQUESTED,
          resource: AUDIT_RESOURCE.USER,
          resourceId: event.userId,
          metadata: {
            email: event.email,
          },
          ipAddress: event.ipAddress,
        });
      },
    );

    // Consume password reset success events and create audit logs
    await consumer.consume<AuthAuditEvent>(
      RABBITMQ_EXCHANGE.AUTH,
      RABBITMQ_ROUTING_KEY.PASSWORD_RESET_SUCCESS,
      RABBITMQ_QUEUE.AUDIT_PASSWORD_RESET_SUCCESS,
      async (event) => {
        await this.createAuditLog({
          user: {
            connect: {
              id: event.userId,
            },
          },
          action: AUDIT_ACTION.PASSWORD_RESET_SUCCESS,
          resource: AUDIT_RESOURCE.USER,
          resourceId: event.userId,
          metadata: {},
          ipAddress: event.ipAddress,
        });
      },
    );
  }

  /**
   * Create an audit log entry in the database using the provided data.
   * @param data - The data for the audit log entry, including user, action, resource, resourceId, metadata, and ipAddress.
   */
  private async createAuditLog(data: Prisma.AuditLogCreateInput): Promise<void> {
    await this.auditRepository.create(data);
  }
}
