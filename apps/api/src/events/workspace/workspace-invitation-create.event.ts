export interface WorkspaceInvitationCreatedEvent {
  invitationId: string;
  workspaceId: string;
  workspaceName: string;

  inviterId: string;
  inviterName: string;

  inviteeId: string;
  inviteeEmail?: string;
  inviteeName?: string;
  roleId: string;
  roleName: string;
  token: string;

  ipAddress: string | null;
}