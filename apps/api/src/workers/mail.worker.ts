import type { MailService } from "../infrastructure/mail/interfaces/mail.service.ts";
import { consumer } from "../infrastructure/queue/index.ts";
import type { UserRegisteredEvent } from "../events/auth/user-registered.event.ts";
import { RABBITMQ_EXCHANGE, RABBITMQ_QUEUE, RABBITMQ_ROUTING_KEY } from "../common/constants/rabbitmq.constant.ts";
import type { UserActionEvent } from "../events/admin/index.ts";

/**
 * EmailWorker is responsible for consuming email-related events from RabbitMQ and sending corresponding emails using the MailService.
 * It listens to events such as user registration and admin user actions, and sends verification emails or user action emails accordingly.
 *
 * The worker uses the MailService to send emails, and it subscribes to specific RabbitMQ exchanges and queues for each event type.
 */
export class EmailWorker {

    // Initialize the EmailWorker with an instance of MailService
    constructor(
        private readonly mailService: MailService,
    ) { }

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

                    console.log(
                    `Verification email sent to ${event.email}`,
                );

                } catch (error) {
                    console.error(
                        "Error sending verification email:",
                        error,
                    );

                }

            },
        );

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

                    console.log(
                        `User action email sent to ${event.email} for action ${event.action}`,
                    );

                } catch (error) {
                    console.error("Error sending user action email:", error);
                }
            }
        );
    }

}