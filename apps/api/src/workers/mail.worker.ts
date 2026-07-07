import type { MailService } from "../infrastructure/mail/interfaces/mail.service.ts";
import { consumer } from "../infrastructure/queue/index.ts";
import type { UserRegisteredEvent } from "../events/auth/user-registered.event.ts";
import { RABBITMQ_EXCHANGE, RABBITMQ_QUEUE, RABBITMQ_ROUTING_KEY } from "../common/constants/rabbitmq.constant.ts";

export class EmailWorker {

    constructor(
        private readonly mailService: MailService,
    ) { }

    async start() {

        await consumer.consume<UserRegisteredEvent>(
            RABBITMQ_EXCHANGE.AUTH,
            RABBITMQ_ROUTING_KEY.USER_REGISTERED,
            RABBITMQ_QUEUE.EMAIL_USER_REGISTERED,

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

    }

}