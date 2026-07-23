export interface WorkspaceDeletedEvent {
  id: string;
  deletedBy: string;
  deletedAt: Date;
  ipAddress?: string | null;
}