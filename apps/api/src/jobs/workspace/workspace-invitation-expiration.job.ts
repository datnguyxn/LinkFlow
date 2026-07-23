import { WorkspaceInvitationRepository } from '../../modules/workspace/repository/workspace-invitation.repository.ts';
import { WorkspaceInvitationPublisher } from '../../publishers/workspace-invitation/workspace-invitation.publisher.ts';
import type { WorkspaceInvitationUpdatedEvent } from '../../events/index.ts';

export class WorkspaceInvitationExpirationJob {
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly workspaceInvitationRepository:
      WorkspaceInvitationRepository,

    private readonly workspaceInvitationPublisher:
      WorkspaceInvitationPublisher,
  ) {}

  async start() {
    console.log(
      '⏰ Workspace invitation expiration job started',
    );

    await this.scheduleNext();
  }

  async stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    console.log(
      '🛑 Workspace invitation expiration job stopped',
    );
  }

  private async scheduleNext() {
    const nextInvitation =
      await this.workspaceInvitationRepository
        .findNextPendingExpiration();

    if (!nextInvitation) {
      return;
    }

    const delay = Math.max(
      nextInvitation.expiresAt.getTime() - Date.now(),
      0,
    );

    this.timer = setTimeout(() => {
      void this.run();
    }, delay);
  }

  private async run() {
    try {
      const invitations =
        await this.workspaceInvitationRepository
          .findExpiredPendingInvitations();

      for (const invitation of invitations) {
        const updatedInvitation =
          await this.workspaceInvitationRepository
            .expire(invitation.id);


        const event: WorkspaceInvitationUpdatedEvent = {
            invitationId: updatedInvitation.id,

            workspaceId: invitation.workspaceId,
            workspaceName: invitation.workspace.name,

            inviterId: invitation.inviterId,
            inviterName: invitation.inviter.fullName ?? "",
            inviterEmail: invitation.inviter.email,

            inviteeId: invitation.userId ?? "",
            inviteeName: invitation.user?.fullName ?? "",
            inviteeEmail: invitation.user?.email ?? "",

            roleName: invitation.role.name,

            previousStatus: invitation.status,
            status: updatedInvitation.status,

            updatedAt: updatedInvitation.updatedAt,
            expiresAt: updatedInvitation.expiresAt,
            ipAddress: null,
        };

        await this.workspaceInvitationPublisher
          .workspaceInvitationExpired(event);
      }

      if (invitations.length > 0) {
        console.log(
          `⏰ Expired ${invitations.length} invitation(s)`,
        );
      }

      await this.scheduleNext();
    } catch (error) {
      console.error(
        '❌ Workspace invitation expiration job failed:',
        error,
      );

      this.timer = setTimeout(() => {
        void this.run();
      }, 60 * 1000);
    }
  }
}