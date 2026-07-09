import { Publisher } from "../../infrastructure/queue/index.ts";
import { RABBITMQ_EXCHANGE, RABBITMQ_ROUTING_KEY, } from "../../common/constants/index.ts";
import type {
    UserRegisteredEvent,
    UserLoginEvent,
    UserLogoutEvent
} from "../../events/auth/index.ts";

/**
 * AuthPublisher is responsible for publishing authentication-related events to RabbitMQ.
 */
export class AuthPublisher {
    constructor(private readonly publisher: Publisher) { }

    // Publish user registration event to RabbitMQ
    async userRegistered(event: UserRegisteredEvent) {
        return this.publisher.publish(
            RABBITMQ_EXCHANGE.AUTH,
            RABBITMQ_ROUTING_KEY.USER_REGISTERED,
            event,
        );
    }

    // Publish user login event to RabbitMQ
    async userLoggedIn(event: UserLoginEvent) {
        return this.publisher.publish(
            RABBITMQ_EXCHANGE.AUTH,
            RABBITMQ_ROUTING_KEY.USER_LOGIN,
            event,
        );
    }

    // Publish user logout event to RabbitMQ
    async userLoggedOut(event: UserLogoutEvent) {
        return this.publisher.publish(
            RABBITMQ_EXCHANGE.AUTH,
            RABBITMQ_ROUTING_KEY.USER_LOGOUT,
            event,
        );
    }
}