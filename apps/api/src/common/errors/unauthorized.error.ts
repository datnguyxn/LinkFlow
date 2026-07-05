import { HTTP_STATUS } from "../constants/index.ts";
import { AppError } from "./app.error.ts";

export class UnauthorizedError extends AppError {
  constructor(message: string, code?: string) {
    super(HTTP_STATUS.UNAUTHORIZED, message, code);
  }
}