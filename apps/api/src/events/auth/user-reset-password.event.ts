export interface PasswordResetRequestedEvent {
  userId: string;
  email: string;
  fullName: string;
  resetToken: string;
  ipAddress?: string;
}
