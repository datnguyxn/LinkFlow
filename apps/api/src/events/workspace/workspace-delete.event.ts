export interface WorkspaceDeletedEvent {
  id: string;
  members: MemberInfo[];
  ownerId: string;
  deletedBy: string;
  deletedAt: Date;
  ipAddress?: string | null;
  workspaceName?: string | null;
}

interface MemberInfo {
  id: string;
  name: string | null;
  email: string;
}