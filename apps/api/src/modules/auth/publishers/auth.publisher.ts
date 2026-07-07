import { Publisher } from "../../../infrastructure/queue/index.ts";
import { RABBITMQ_EXCHANGE, RABBITMQ_ROUTING_KEY,  } from "../../../common/constants/index.ts";
import type { UserRegisteredEvent } from "../../../events/auth/user-registered.event.ts";
import type { UserLoginEvent } from "../../../events/auth/user-login.event.ts";

export class AuthPublisher {
    constructor(private readonly publisher: Publisher) {}

    async userRegistered(event: UserRegisteredEvent) {
        return this.publisher.publish(
            RABBITMQ_EXCHANGE.AUTH,
            RABBITMQ_ROUTING_KEY.USER_REGISTERED,
            event,
        );
    }

    async userLoggedIn(event: UserLoginEvent) {
        return this.publisher.publish(
            RABBITMQ_EXCHANGE.AUTH,
            RABBITMQ_ROUTING_KEY.USER_LOGIN,
            event,
        );
    }
}