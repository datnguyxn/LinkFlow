import { RedirectType, UrlStatus } from '@prisma/client';

export interface UrlUpdatedEvent {
    id: string;

    workspaceId: string;
    userId: string;

    shortCode: string;
    originalUrl: string;

    title: string | null;
    description: string | null;
    faviconUrl: string | null;

    redirectType: RedirectType;
    urlStatus: UrlStatus;

    expiresAt: Date | null;
    maxClicks: number | null;

    updatedAt: Date;
    deletedAt: Date | null;
    expiredAt: Date | null;

    changedFields: string[] | null;

    ipAddress: string | null;
}