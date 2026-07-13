import { HTTP_STATUS } from '../constants/index.ts';
import { AppError } from './app.error.ts';

export class InternalServerError extends AppError {
  constructor(message: string, code?: string) {
    super(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, code);
  }
}
