import { Publisher } from '../../infrastructure/queue/index.ts';
import { RABBITMQ_EXCHANGE, RABBITMQ_ROUTING_KEY } from '../../common/constants/index.ts';
import type {
  UserProfileUpdatedEvent,
  UserAvatarUpdatedEvent,
  UserPasswordChangedEvent,
  UserAccountDeletedEvent,
} from '../../events/index.ts';

/**
 * UserPublisher is responsible for publishing user-related events to RabbitMQ.
 */
export class UserPublisher {
  constructor(private readonly publisher: Publisher) {}

  // Publish user profile updated event to RabbitMQ
  async userProfileUpdated(event: UserProfileUpdatedEvent) {
    return this.publisher.publish(
      RABBITMQ_EXCHANGE.USER,
      RABBITMQ_ROUTING_KEY.USER_PROFILE_UPDATED,
      event,
    );
  }

  // Publish user password changed event to RabbitMQ
  async userPasswordChanged(event: UserPasswordChangedEvent) {
    return this.publisher.publish(
      RABBITMQ_EXCHANGE.USER,
      RABBITMQ_ROUTING_KEY.USER_PASSWORD_CHANGED,
      event,
    );
  }

  // Publish user avatar updated event to RabbitMQ
  async userAvatarUpdated(event: UserAvatarUpdatedEvent) {
    return this.publisher.publish(
      RABBITMQ_EXCHANGE.USER,
      RABBITMQ_ROUTING_KEY.USER_AVATAR_UPDATED,
      event,
    );
  }

  // Publish user account deleted event to RabbitMQ
  async userAccountDeleted(event: UserAccountDeletedEvent) {
    return this.publisher.publish(
      RABBITMQ_EXCHANGE.USER,
      RABBITMQ_ROUTING_KEY.USER_ACCOUNT_DELETED,
      event,
    );
  }
}
