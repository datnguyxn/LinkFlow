import { AuditLogRepository } from '../../modules/audit-log/repository/audit-log.repository.ts';
import { consumer } from '../../infrastructure/queue/index.ts';
import {
  RABBITMQ_EXCHANGE,
  RABBITMQ_QUEUE,
  RABBITMQ_ROUTING_KEY,
} from '../../common/constants/index.ts';
import { AUDIT_RESOURCE } from '../../common/constants/audit.constant.ts';
import { createAuditLog } from '../../utils/create-audit.util.ts';
import type { UserActionEvent } from '../../events/index.ts';

/**
 * AdminUserAuditWorker is responsible for consuming admin user-related events from RabbitMQ and creating corresponding audit logs in the database.
 * It listens to events such as admin actions on users, and records them in the audit log repository.
 *
 * The worker uses the AuditLogRepository to persist audit logs, and it subscribes to specific RabbitMQ exchanges and queues for each event type.
 */
export class AdminUserAuditWorker {
  // Initialize the AdminUserAuditWorker with an instance of AuditLogRepository
  constructor(private readonly auditRepository: AuditLogRepository) {}

  /**
   * Start the AdminUserAuditWorker to consume events from RabbitMQ and create audit logs.
   * This method sets up consumers for user registration, login, logout, and admin action events.
   * Each consumer listens to a specific exchange, routing key, and queue, and processes incoming events to create audit logs.
   */
  async start() {
    // Consume admin user action events and create audit logs
    await consumer.consume<UserActionEvent>(
      RABBITMQ_EXCHANGE.ADMIN_USER,
      RABBITMQ_ROUTING_KEY.USER_ACTION,
      RABBITMQ_QUEUE.AUDIT_USER_ACTION,

      // Process the admin user action event and create an audit log entry
      async (event) => {
        await createAuditLog(
          {
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
          },
          this.auditRepository,
        );

        console.log(
          `Audit log created for admin user action: ${event.action} on user ${event.targetUserId}`,
        );
      },
    );
  }
}
