import { z } from 'zod';

/**
 * Validation schema for forgot password request
 * - Ensures email format is valid
 */
export const forgotPasswordSchema = z.object({
  /**
   * User email
   * Must be a valid email format
   */
  email: z.string().email({ message: 'auth.invalidEmail' }),
});

/**
 * Type inferred from forgot password schema
 * Used in service/controller layers
 */
export type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema>;
