export interface ApiErrorItem {
  code: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  data: null;
  errors?: ApiErrorItem[];
  meta: {
    timestamp: string;
    requestId: string;
  };
}

export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta: {
    timestamp: string;
    requestId: string;
  };
}