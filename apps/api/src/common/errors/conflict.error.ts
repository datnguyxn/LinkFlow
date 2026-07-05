import { HTTP_STATUS } from "../constants/index.ts";
import { AppError } from "./app.error.ts";

export class ConflictError extends AppError {
  constructor(message: string, code?: string) {
    super(HTTP_STATUS.CONFLICT, message, code);
  }
}