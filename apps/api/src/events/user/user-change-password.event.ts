export interface UserPasswordChangedEvent {
  userId: string;
  changedBy: string;
  changedAt: Date;
  ipAddress?: string | null;
}
