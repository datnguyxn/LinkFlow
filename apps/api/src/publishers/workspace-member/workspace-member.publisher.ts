import { Publisher } from '../../infrastructure/queue/index.ts';
import type {
  WorkspaceOwnershipTransferredEvent,
  WorkspaceMemberRoleUpdatedEvent,
  WorkspaceMemberLeaveEvent,
  WorkspaceMemberRemoveEvent,
} from '../../events/index.ts';

import { RABBITMQ_EXCHANGE, RABBITMQ_ROUTING_KEY } from '../../common/constants/index.ts';

export class WorkspaceMemberPublisher {
  constructor(private readonly publisher: Publisher) {}

  async workspaceOwnershipTransferred(event: WorkspaceOwnershipTransferredEvent) {
    return this.publisher.publish(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_OWNERSHIP_TRANSFERRED,
      event,
    );
  }

  async workspaceMemberRoleUpdated(event: WorkspaceMemberRoleUpdatedEvent) {
    return this.publisher.publish(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_MEMBER_ROLE_UPDATED,
      event,
    );
  }

  async workspaceMemberLeave(event: WorkspaceMemberLeaveEvent) {
    return this.publisher.publish(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_MEMBER_LEAVE,
      event,
    );
  }

  async workspaceMemberRemove(event: WorkspaceMemberRemoveEvent) {
    return this.publisher.publish(
      RABBITMQ_EXCHANGE.WORKSPACE,
      RABBITMQ_ROUTING_KEY.WORKSPACE_MEMBER_REMOVE,
      event,
    );
  }
}
