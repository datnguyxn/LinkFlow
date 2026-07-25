import type { MailService } from '../../infrastructure/mail/interfaces/mail.service.ts';
import { consumer } from '../../infrastructure/queue/index.ts';
import {
  RABBITMQ_EXCHANGE,
  RABBITMQ_QUEUE,
  RABBITMQ_ROUTING_KEY,
} from '../../common/constants/rabbitmq.constant.ts';
import type { PasswordResetRequestedEvent, UserRegisteredEvent } from '../../events/index.ts';

/**
 * AuthMailWorker is responsible for consuming authentication-related events from RabbitMQ and sending corresponding emails using the MailService.
 * It listens to events such as user registration and admin user actions, and sends verification emails or user action emails accordingly.
 *
 * The worker uses the MailService to send emails, and it subscribes to specific RabbitMQ exchanges and queues for each event type.
 */
export class AuthMailWorker {
  constructor(private readonly mailService: MailService) {}

  // Start the EmailWorker to consume events from RabbitMQ and send emails.
  async start() {
    // Consume user registration events and send verification emails
    await consumer.consume<UserRegisteredEvent>(
      RABBITMQ_EXCHANGE.AUTH,
      RABBITMQ_ROUTING_KEY.USER_REGISTERED,
      RABBITMQ_QUEUE.EMAIL_USER_REGISTERED,

      // Process the user registration event and send a verification email
      async (event) => {
        try {
          await this.mailService.sendVerificationEmail({
            email: event.email,

            fullName: event.fullName,

            verifyToken: event.verifyToken,
          });

          console.log(`Verification email sent to ${event.email}`);
        } catch (error) {
          console.error('Error sending verification email:', error);
        }
      },
    );

    // Consume password reset requested events and send reset password emails
    await consumer.consume<PasswordResetRequestedEvent>(
      RABBITMQ_EXCHANGE.AUTH,
      RABBITMQ_ROUTING_KEY.PASSWORD_RESET_REQUESTED,
      RABBITMQ_QUEUE.EMAIL_PASSWORD_RESET_REQUESTED,

      // Process the password reset requested event and send a reset password email
      async (event) => {
        try {
          await this.mailService.sendResetPasswordEmail({
            email: event.email,
            fullName: event.fullName,
            resetToken: event.resetToken,
          });

          console.log(`Reset password email sent to ${event.email}`);
        } catch (error) {
          console.error('Error sending reset password email:', error);
        }
      },
    );

    await consumer.consume<UserRegisteredEvent>(
      RABBITMQ_EXCHANGE.AUTH,
      RABBITMQ_ROUTING_KEY.EMAIL_VERIFIED,
      RABBITMQ_QUEUE.EMAIL_USER_WELCOME,
      async (event) => {
        try {
          await this.mailService.sendWelcomeEmail({
            email: event.email,
            fullName: event.fullName,
          });

          console.log(`Welcome email sent to ${event.email}`);
        } catch (error) {
          console.error('Error sending welcome email:', error);
        }
      },
    );
  }
}
