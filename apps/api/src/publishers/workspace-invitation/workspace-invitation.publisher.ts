import { Publisher } from '../../infrastructure/queue/index.ts';
import type { WorkspaceInvitationCreatedEvent, WorkspaceInvitationUpdatedEvent } from '../../events/index.ts';
import { RABBITMQ_EXCHANGE, RABBITMQ_ROUTING_KEY } from '../../common/constants/index.ts';

export class WorkspaceInvitationPublisher {
    constructor(private readonly publisher: Publisher) { }

    // Publish workspace created event to RabbitMQ
    async workspaceInvitationCreated(event: WorkspaceInvitationCreatedEvent) {
        return this.publisher.publish(
            RABBITMQ_EXCHANGE.WORKSPACE,
            RABBITMQ_ROUTING_KEY.WORKSPACE_INVITATION_CREATED,
            event,
        );
    }

    async workspaceInvitationAccepted(event: WorkspaceInvitationUpdatedEvent) {
        return this.publisher.publish(
            RABBITMQ_EXCHANGE.WORKSPACE,
            RABBITMQ_ROUTING_KEY.WORKSPACE_INVITATION_ACCEPTED, // Use the appropriate routing key based on the event type
            event,
        );
    }

    async workspaceInvitationRejected(event: WorkspaceInvitationUpdatedEvent) {
        return this.publisher.publish(
            RABBITMQ_EXCHANGE.WORKSPACE,
            RABBITMQ_ROUTING_KEY.WORKSPACE_INVITATION_REJECTED, // Use the appropriate routing key based on the event type
            event,
        );
    }

    async workspaceInvitationRevoked(event: WorkspaceInvitationUpdatedEvent) {
        return this.publisher.publish(
            RABBITMQ_EXCHANGE.WORKSPACE,
            RABBITMQ_ROUTING_KEY.WORKSPACE_INVITATION_REVOKED, // Use the appropriate routing key based on the event type
            event,
        );
    }

    async workspaceInvitationExpired(event: WorkspaceInvitationUpdatedEvent) {
        return this.publisher.publish(
            RABBITMQ_EXCHANGE.WORKSPACE,
            RABBITMQ_ROUTING_KEY.WORKSPACE_INVITATION_EXPIRED, // Use the appropriate routing key based on the event type
            event,
        );
    }
}