import { UrlStatus } from '@prisma/client';

export interface UrlDeletedEvent {
    id: string;
    workspaceId: string;
    userId: string;
    deletedBy: string;
    shortCode: string;
    originalUrl: string;
    title?: string | null;
    status: UrlStatus;
    deletedAt: Date;
    ipAddress?: string | null;
}