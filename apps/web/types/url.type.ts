import { Pagination } from './pagination.type';

export interface UrlTag {
  id: string;
  name: string;
  color?: string;
}

export interface UrlQrCode {
  id: string;
  imageUrl: string;
}

export interface Url {
  id: string;
  workspaceId: string;
  userId: string;

  shortCode: string;
  originalUrl: string;

  title: string | null;
  description: string | null;
  faviconUrl: string | null;

  redirectType: 'PERMANENT' | 'TEMPORARY';

  passwordHash: string | null;

  expiresAt: string | null;
  maxClicks: number | null;
  clickCount: number;

  status: 'ACTIVE' | 'DISABLED' | 'EXPIRED';

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface UrlDetail extends Url {
  qrCode: UrlQrCode | null;

  tags: UrlTag[];
}

export interface UrlSummary {
  total: number;

  active: number;

  expired: number;

  disabled: number;
}

export interface UrlListResponse {
  urls: UrlDetail[];

  summary: UrlSummary;

  pagination: Pagination;
}

export interface UrlDetailResponse {
  data: UrlDetail;
}