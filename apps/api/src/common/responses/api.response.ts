export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  errors?: ApiError[];
  meta: ApiMeta;
}

export interface ApiError {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiMeta {
  timestamp: string;
  requestId: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
