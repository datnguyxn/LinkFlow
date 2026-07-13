import { Publisher } from '../../infrastructure/queue/index.ts';
import { RABBITMQ_EXCHANGE, RABBITMQ_ROUTING_KEY } from '../../common/constants/index.ts';
import type {
  UserRegisteredEvent,
  UserLoginEvent,
  UserLogoutEvent,
  PasswordResetRequestedEvent,
  AuthAuditEvent,
} from '../../events/index.ts';

/**
 * AuthPublisher is responsible for publishing authentication-related events to RabbitMQ.
 */
export class AuthPublisher {
  constructor(private readonly publisher: Publisher) {}

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
    return this.publisher.publish(RABBITMQ_EXCHANGE.AUTH, RABBITMQ_ROUTING_KEY.USER_LOGIN, event);
  }

  // Publish user logout event to RabbitMQ
  async userLoggedOut(event: UserLogoutEvent) {
    return this.publisher.publish(RABBITMQ_EXCHANGE.AUTH, RABBITMQ_ROUTING_KEY.USER_LOGOUT, event);
  }

  async passwordResetRequested(event: PasswordResetRequestedEvent) {
    return this.publisher.publish(
      RABBITMQ_EXCHANGE.AUTH,
      RABBITMQ_ROUTING_KEY.PASSWORD_RESET_REQUESTED,
      event,
    );
  }

  async emailVerified(event: AuthAuditEvent) {
    return this.publisher.publish(
      RABBITMQ_EXCHANGE.AUTH,
      RABBITMQ_ROUTING_KEY.EMAIL_VERIFIED,
      event,
    );
  }

  async verificationEmailResent(event: AuthAuditEvent) {
    return this.publisher.publish(
      RABBITMQ_EXCHANGE.AUTH,
      RABBITMQ_ROUTING_KEY.VERIFICATION_EMAIL_RESENT,
      event,
    );
  }

  async passwordResetSuccess(event: AuthAuditEvent) {
    return this.publisher.publish(
      RABBITMQ_EXCHANGE.AUTH,
      RABBITMQ_ROUTING_KEY.PASSWORD_RESET_SUCCESS,
      event,
    );
  }
}
