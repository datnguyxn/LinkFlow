export interface WorkspaceOwnershipTransferredEvent {
  workspaceId: string;
  workspaceName: string;

  previousOwner: {
    userId: string;
    name: string;
    email: string;
    newRole: 'MEMBER';
  };

  newOwner: {
    userId: string;
    name: string;
    email: string;
    newRole: 'OWNER';
  };

  transferredAt: Date;

  ipAddress?: string | null;
}
