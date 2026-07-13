import { type TSchema } from '@sinclair/typebox';
import { ErrorResponseSchema } from './error-response.schema.ts';
import { SuccessResponseSchema } from './success-response.schema.ts';

export function createSwaggerResponse(
  successStatus: number,
  successData: TSchema,
  additionalErrors: number[] = [],
) {
  const responses: Record<number, unknown> = {
    [successStatus]: SuccessResponseSchema(successData),

    400: ErrorResponseSchema,
    401: ErrorResponseSchema,
    403: ErrorResponseSchema,
    404: ErrorResponseSchema,
    500: ErrorResponseSchema,
  };

  for (const status of additionalErrors) {
    responses[status] = ErrorResponseSchema;
  }

  return responses;
}
