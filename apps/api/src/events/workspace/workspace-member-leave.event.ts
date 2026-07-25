export interface WorkspaceMemberLeaveEvent {
  workspaceId: string;
  workspaceName: string;
  memberId: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
  deleteAt?: Date;
  ipAddress?: string;
}
