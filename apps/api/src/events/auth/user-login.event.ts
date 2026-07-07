export interface UserLoginEvent {
    userId: string;
    email: string;
    fullName: string;
    ipAddress?: string;
}