export interface AuthAuditEvent {
  userId: string;
  email: string;
  fullName: string;
  ipAddress?: string;
}
