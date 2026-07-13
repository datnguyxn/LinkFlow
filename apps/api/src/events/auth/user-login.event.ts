export interface UserLoginEvent {
  userId: string;
  email: string;
  fullName: string;
  ipAddress?: string;
  method: 'password' | 'google'; // Added method to indicate the login method
}
