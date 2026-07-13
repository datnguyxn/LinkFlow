import { HTTP_STATUS } from '../constants/index.ts';
import { AppError } from './app.error.ts';

export class TooManyRequestsError extends AppError {
  constructor(message: string, code?: string) {
    super(HTTP_STATUS.TOO_MANY_REQUESTS, message, code);
  }
}
