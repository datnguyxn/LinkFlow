export interface UserAvatarUpdatedEvent {
  userId: string;
  updatedBy: string;
  updatedAt: Date;
  ipAddress?: string | null;
}
