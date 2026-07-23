export interface UserAccountDeletedEvent {
  userId: string;
  deletedBy: string;
  deletedAt: Date;
  ipAddress?: string | null;
}
