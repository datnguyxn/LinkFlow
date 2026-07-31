export interface WorkspaceMemberRoleUpdatedEvent {
  workspaceId: string;
  workspaceName: string;
  slug: string;
  
  memberId: string;
  userId: string;

  memberName: string;
  memberEmail: string;

  previousRoleId: string;
  previousRoleName: string;

  newRoleId: string;
  newRoleName: string;

  updatedAt: Date;
  ipAddress?: string | null;
}
