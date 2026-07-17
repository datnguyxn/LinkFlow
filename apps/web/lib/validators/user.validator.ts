import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    /**
     * Old Password rules:
     * - 8 to 32 characters
     * - At least 1 uppercase letter
     * - At least 1 lowercase letter
     * - At least 1 number
     * - At least 1 special character
     */
    oldPassword: z
      .string()
      .min(8, { message: 'auth.passwordTooShort' })
      .max(32, { message: 'auth.passwordTooLong' })
      .regex(/[A-Z]/, { message: 'auth.passwordMissingUppercase' })
      .regex(/[a-z]/, { message: 'auth.passwordMissingLowercase' })
      .regex(/[0-9]/, { message: 'auth.passwordMissingNumber' })
      .regex(/[^A-Za-z0-9]/, { message: 'auth.passwordMissingSpecialCharacter' }),
    /**
     * New Password rules:
     * - 8 to 32 characters
     * - At least 1 uppercase letter
     * - At least 1 lowercase letter
     * - At least 1 number
     * - At least 1 special character
     */
    newPassword: z
      .string()
      .min(8, { message: 'auth.passwordTooShort' })
      .max(32, { message: 'auth.passwordTooLong' })
      .regex(/[A-Z]/, { message: 'auth.passwordMissingUppercase' })
      .regex(/[a-z]/, { message: 'auth.passwordMissingLowercase' })
      .regex(/[0-9]/, { message: 'auth.passwordMissingNumber' })
      .regex(/[^A-Za-z0-9]/, { message: 'auth.passwordMissingSpecialCharacter' }),

    /**
     * Confirm Password rules:
     * - 8 to 32 characters
     * - At least 1 uppercase letter
     * - At least 1 lowercase letter
     * - At least 1 number
     * - At least 1 special character
     */
    confirmPassword: z
      .string()
      .min(8, { message: 'auth.passwordTooShort' })
      .max(32, { message: 'auth.passwordTooLong' })
      .regex(/[A-Z]/, { message: 'auth.passwordMissingUppercase' })
      .regex(/[a-z]/, { message: 'auth.passwordMissingLowercase' })
      .regex(/[0-9]/, { message: 'auth.passwordMissingNumber' })
      .regex(/[^A-Za-z0-9]/, { message: 'auth.passwordMissingSpecialCharacter' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

/**
 * Type definitions for form values based on the validation schemas
 * - RegisterForm: Values for user registration form
 * - LoginForm: Values for user login form
 * - ForgotPasswordForm: Values for forgot password form
 * - ResetPasswordForms: Values for reset password form
 */
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
