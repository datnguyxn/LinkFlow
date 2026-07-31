export interface ActivityLogUser {
  fullName: string;
  avatarUrl: string | null;
}

export interface ActivityLogMetadata {
  updatedAt?: string;
  changedFields?: string[];
  [key: string]: unknown;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  metadata: ActivityLogMetadata;
  ipAddress: string | null;
  createdAt: string;

  user: ActivityLogUser;
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
