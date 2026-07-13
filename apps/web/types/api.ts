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
