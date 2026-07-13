import { Publisher } from '../../../infrastructure/queue/index.ts';
import { RABBITMQ_EXCHANGE, RABBITMQ_ROUTING_KEY } from '../../../common/constants/index.ts';
import type { UserActionEvent } from '../../../events/index.ts';

/**
 * AdminUserPublisher is responsible for publishing admin user-related events to RabbitMQ.
 */
export class AdminUserPublisher {
  // Initialize the AdminUserPublisher with a Publisher instance
  constructor(private readonly publisher: Publisher) {}

  /**
   * Publish user action event to RabbitMQ
   * @param event
   */
  async userAction(event: UserActionEvent) {
    await this.publisher.publish(
      RABBITMQ_EXCHANGE.ADMIN_USER,
      RABBITMQ_ROUTING_KEY.USER_ACTION,
      event,
    );
  }
}
