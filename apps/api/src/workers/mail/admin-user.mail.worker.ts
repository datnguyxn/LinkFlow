import type { MailService } from '../../infrastructure/mail/interfaces/mail.service.ts';
import { consumer } from '../../infrastructure/queue/index.ts';
import {
  RABBITMQ_EXCHANGE,
  RABBITMQ_QUEUE,
  RABBITMQ_ROUTING_KEY,
} from '../../common/constants/rabbitmq.constant.ts';
import type { UserActionEvent } from '../../events/index.ts';

/**
 * AdminUserMailWorker is responsible for consuming admin user action events from RabbitMQ and sending corresponding emails using the MailService.
 * It listens to events such as user actions performed by administrators, and sends user action emails accordingly.
 *
 * The worker uses the MailService to send emails, and it subscribes to specific RabbitMQ exchanges and queues for each event type.
 */
export class AdminUserMailWorker {
  constructor(private readonly mailService: MailService) {}

  async start() {
    // Consume admin user action events and send user action emails
    await consumer.consume<UserActionEvent>(
      RABBITMQ_EXCHANGE.ADMIN_USER,
      RABBITMQ_ROUTING_KEY.USER_ACTION,
      RABBITMQ_QUEUE.EMAIL_USER_ACTION,

      // Process the admin user action event and send a user action email
      async (event) => {
        try {
          await this.mailService.sendUserActionEmail({
            email: event.email,
            fullName: event.fullName,
            action: event.action,
            reason: event.reason,
            actionTime: event.timestamp,
          });

          console.log(`User action email sent to ${event.email} for action ${event.action}`);
        } catch (error) {
          console.error('Error sending user action email:', error);
        }
      },
    );
  }
}
