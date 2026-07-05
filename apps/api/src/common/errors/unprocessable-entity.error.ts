import { HTTP_STATUS } from "../constants/index.ts";
import { AppError } from "./app.error.ts";

export class UnprocessableEntityError extends AppError {
  constructor(message: string, code?: string) {
    super(HTTP_STATUS.UNPROCESSABLE_ENTITY, message, code);
  }
}