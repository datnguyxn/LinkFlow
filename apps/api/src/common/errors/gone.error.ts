import { HTTP_STATUS } from '../constants/index.ts';
import { AppError } from './app.error.ts';

export class GoneError extends AppError {
  constructor(message: string, code?: string) {
    super(HTTP_STATUS.GONE, message, code);
  }
}
