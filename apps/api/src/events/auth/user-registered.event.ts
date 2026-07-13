export interface UserRegisteredEvent {
  userId: string;
  email: string;
  fullName: string;
  verifyToken: string;
  ipAddress?: string;
}
