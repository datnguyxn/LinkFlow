import { Publisher } from '../../infrastructure/queue/index.ts';
import { RABBITMQ_EXCHANGE, RABBITMQ_ROUTING_KEY } from '../../common/constants/index.ts';
import type {
  WorkspaceCreatedEvent,
  WorkspaceUpdatedEvent,
  WorkspaceDeletedEvent,
} from '../../events/index.ts';

/**
 * WorkspacePublisher is responsible for publishing workspace-related events to RabbitMQ.
 */
export class WorkspacePublisher {
  constructor(private readonly publisher: Publisher) {}

  // Publish workspace created event to RabbitMQ
  async workspaceCreated(event: WorkspaceCreatedEvent) {
    return this.publisher.publish(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_CREATED,
      event,
    );
  }

  async workspaceUpdated(event: WorkspaceUpdatedEvent) {
    return this.publisher.publish(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_UPDATED,
      event,
    );
  }

  async workspaceDeleted(event: WorkspaceDeletedEvent) {
    return this.publisher.publish(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_DELETED,
      event,
    );
  }
}
