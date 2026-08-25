import { RedirectType } from '@prisma/client';

export interface UrlCreatedEvent {
    id: string;

    workspaceId: string;
    userId: string;

    shortCode: string;
    originalUrl: string;

    title: string | null;
    description: string | null;
    faviconUrl: string | null;

    redirectType: RedirectType;

    expiresAt: Date | null;
    maxClicks: number | null;

    createdAt: Date;

    ipAddress: string | null;
}