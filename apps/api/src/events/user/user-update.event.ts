export interface UserProfileUpdatedEvent {
  userId: string;
  updatedBy: string;
  updatedAt: Date;
  changedFields: string[];
  ipAddress?: string | null;
}
