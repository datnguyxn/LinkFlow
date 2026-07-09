export interface UserLogoutEvent {
    userId: string;
    ipAddress?: string;
    userAgent?: string;
}