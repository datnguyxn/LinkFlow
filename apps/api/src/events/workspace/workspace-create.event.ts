export interface WorkspaceCreatedEvent {
  workspaceId: string;
  ownerId: string;
  name: string;
  slug: string;
  createdAt: Date;
  ipAddress?: string | null;
}