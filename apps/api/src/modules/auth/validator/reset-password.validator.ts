import { z } from 'zod';

/**
 * Validation schema for reset password request
 * - Ensures email format is valid
 */
export const resetPasswordSchema = z.object({
  /**
   * Password rules:
   * - 8 to 32 characters
   * - At least 1 uppercase letter
   * - At least 1 lowercase letter
   * - At least 1 number
   * - At least 1 special character
   */
  password: z
    .string()
    .min(8, { message: 'auth.passwordTooShort' })
    .max(32, { message: 'auth.passwordTooLong' })
    .regex(/[A-Z]/, { message: 'auth.passwordMissingUppercase' })
    .regex(/[a-z]/, { message: 'auth.passwordMissingLowercase' })
    .regex(/[0-9]/, { message: 'auth.passwordMissingNumber' })
    .regex(/[^A-Za-z0-9]/, { message: 'auth.passwordMissingSpecialCharacter' }),
});

/**
 * Type inferred from reset password schema
 * Used in service/controller layers
 */
export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>;
