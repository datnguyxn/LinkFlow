import { Publisher } from "../../../infrastructure/queue/index.ts";
import { RABBITMQ_QUEUE } from "../../../common/constants/index.ts";
import type { UserRegisteredEvent } from "../../../events/auth/user-registered.event.ts";

export class AuthPublisher {
    constructor(private readonly publisher: Publisher) {}

    async userRegistered(event: UserRegisteredEvent) {
        return this.publisher.publish(
            RABBITMQ_QUEUE.EMAIL_USER_REGISTERED,
            event,
        );
    }
}