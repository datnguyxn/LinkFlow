export interface WorkspaceMemberRemoveEvent {
  workspaceId: string;
  workspaceName: string;
  ownerName: string;
  userId: string;
  memberId: string;
  email: string;
  fullName: string;
  role: string;
  deleteAt?: Date;
  ipAddress?: string;
}
