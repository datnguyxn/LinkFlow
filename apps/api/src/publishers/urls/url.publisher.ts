import { Publisher } from '../../infrastructure/queue/index.ts';
import { RABBITMQ_EXCHANGE, RABBITMQ_ROUTING_KEY } from '../../common/constants/index.ts';
import type {
    UrlCreatedEvent,
    UrlUpdatedEvent,
    UrlDeletedEvent,
} from '../../events/index.ts';

/**
 * UrlPublisher is responsible for publishing URL-related events to RabbitMQ.
 */
export class UrlPublisher {
    // The constructor takes a Publisher instance as a parameter, which is used to publish events to RabbitMQ.
    constructor(private readonly publisher: Publisher) {}

    // Publish URL created event to RabbitMQ
    async publishUrlCreated(event: UrlCreatedEvent) {
        return this.publisher.publish(
            RABBITMQ_EXCHANGE.URL,
            RABBITMQ_ROUTING_KEY.URL_CREATED,
            event,
        );
    }

    // Publish URL updated event to RabbitMQ
    async publishUrlUpdated(event: UrlUpdatedEvent) {
        return this.publisher.publish(
            RABBITMQ_EXCHANGE.URL,
            RABBITMQ_ROUTING_KEY.URL_UPDATED,
            event,
        );
    }

    // Publish URL deleted event to RabbitMQ
    async publishUrlDeleted(event: UrlDeletedEvent) {
        return this.publisher.publish(
            RABBITMQ_EXCHANGE.URL,
            RABBITMQ_ROUTING_KEY.URL_DELETED,
            event,
        );
    }
}