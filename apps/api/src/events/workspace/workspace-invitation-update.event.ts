import { InvitationStatus } from '@prisma/client';

export interface WorkspaceInvitationUpdatedEvent {
  invitationId: string;
  workspaceId: string;
  workspaceName: string;
  inviterId: string;
  inviterName: string;
  inviterEmail: string;
  inviteeId: string;
  inviteeName: string;
  inviteeEmail: string;
  roleName: string;
  previousStatus: InvitationStatus;
  status: InvitationStatus;
  revokedAt?: Date | null;
  rejectedAt?: Date | null;
  acceptedAt?: Date | null;
  expiresAt?: Date | null;
  updatedAt: Date;
  ipAddress?: string | null;
}
