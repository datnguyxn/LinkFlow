import { AuditLogRepository } from '../../modules/audit-log/repository/audit-log.repository.ts';
import { consumer } from '../../infrastructure/queue/index.ts';
import {
  RABBITMQ_EXCHANGE,
  RABBITMQ_QUEUE,
  RABBITMQ_ROUTING_KEY,
} from '../../common/constants/index.ts';
import { AUDIT_ACTION, AUDIT_RESOURCE } from '../../common/constants/audit.constant.ts';

import type {
  UserRegisteredEvent,
  UserLoginEvent,
  UserLogoutEvent,
  PasswordResetRequestedEvent,
  AuthAuditEvent,
  AuthSessionRevokedEvent,
} from '../../events/index.ts';
import { createAuditLog } from '../../utils/create-audit.util.ts';

/**
 * AuthAuditWorker is responsible for consuming authentication-related events from RabbitMQ and creating corresponding audit logs in the database.
 * It listens to events such as user registration, login, logout, and session revocation, and records them in the audit log repository.
 *
 * The worker uses the AuditLogRepository to persist audit logs, and it subscribes to specific RabbitMQ exchanges and queues for each event type.
 */
export class AuthAuditWorker {
  constructor(private readonly auditRepository: AuditLogRepository) {}

  async start() {
    await consumer.consume<UserRegisteredEvent>(
      RABBITMQ_EXCHANGE.AUTH,
      RABBITMQ_ROUTING_KEY.USER_REGISTERED,
      RABBITMQ_QUEUE.AUDIT_USER_REGISTERED,

      // Process the user registration event and create an audit log entry
      async (event) => {
        await createAuditLog(
          {
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
          },
          this.auditRepository,
        );

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
        await createAuditLog(
          {
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
          },
          this.auditRepository,
        );

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
        await createAuditLog(
          {
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
          },
          this.auditRepository,
        );

        console.log(`Audit log created for user logout: ${event.userId}`);
      },
    );

    await consumer.consume<AuthAuditEvent>(
      RABBITMQ_EXCHANGE.AUTH,
      RABBITMQ_ROUTING_KEY.EMAIL_VERIFIED,
      RABBITMQ_QUEUE.AUDIT_EMAIL_VERIFIED,
      async (event) => {
        await createAuditLog(
          {
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
          },
          this.auditRepository,
        );
      },
    );

    // Consume verification email resent events and create audit logs
    await consumer.consume<AuthAuditEvent>(
      RABBITMQ_EXCHANGE.AUTH,
      RABBITMQ_ROUTING_KEY.VERIFICATION_EMAIL_RESENT,
      RABBITMQ_QUEUE.AUDIT_VERIFICATION_EMAIL_RESENT,
      async (event) => {
        await createAuditLog(
          {
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
          },
          this.auditRepository,
        );

        console.log(`Audit log created for verification email resent: ${event.userId}`);
      },
    );

    // Consume password reset requested events and create audit logs
    await consumer.consume<PasswordResetRequestedEvent>(
      RABBITMQ_EXCHANGE.AUTH,
      RABBITMQ_ROUTING_KEY.PASSWORD_RESET_REQUESTED,
      RABBITMQ_QUEUE.AUDIT_PASSWORD_RESET_REQUESTED,
      async (event) => {
        await createAuditLog(
          {
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
          },
          this.auditRepository,
        );

        console.log(`Audit log created for password reset requested: ${event.userId}`);
      },
    );

    // Consume password reset success events and create audit logs
    await consumer.consume<AuthAuditEvent>(
      RABBITMQ_EXCHANGE.AUTH,
      RABBITMQ_ROUTING_KEY.PASSWORD_RESET_SUCCESS,
      RABBITMQ_QUEUE.AUDIT_PASSWORD_RESET_SUCCESS,
      async (event) => {
        await createAuditLog(
          {
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
          },
          this.auditRepository,
        );

        console.log(`Audit log created for password reset success: ${event.userId}`);
      },
    );

    await consumer.consume<AuthSessionRevokedEvent>(
      RABBITMQ_EXCHANGE.AUTH,
      RABBITMQ_ROUTING_KEY.USER_SESSION_REVOKED,
      RABBITMQ_QUEUE.AUDIT_SESSION_REVOKED,
      async (event) => {
        await createAuditLog(
          {
            user: {
              connect: {
                id: event.userId,
              },
            },
            action: AUDIT_ACTION.AUTH_SESSION_REVOKED,
            resource: AUDIT_RESOURCE.USER,
            resourceId: event.userId,
            metadata: {
              sessionId: event.sessionId,
              revokedBy: event.revokedBy,
              revokedAt: new Date(event.revokedAt),
              reason: event.reason,
            },
            ipAddress: event.ipAddress || null,
          },
          this.auditRepository,
        );

        console.log(`Audit log created for session revocation: ${event.sessionId}`);
      },
    );
  }
}
