import { z } from 'zod';

export const loginSchema = z.object({
  /**
   * User email
   * Must be a valid email format
   */
  email: z.string().email({ message: 'auth.invalidEmail' }),

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

  rememberMe: z.boolean(),
});

export const registerSchema = z.object({
  /**
   * User email
   * Must be a valid email format
   */
  email: z.string().email({ message: 'auth.invalidEmail' }),

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

  /**
   * Confirm password rules:
   * - Must match the password field
   */
  confirmPassword: z
    .string()
    .min(8, { message: 'auth.passwordTooShort' })
    .max(32, { message: 'auth.passwordTooLong' })
    .regex(/[A-Z]/, { message: 'auth.passwordMissingUppercase' })
    .regex(/[a-z]/, { message: 'auth.passwordMissingLowercase' })
    .regex(/[0-9]/, { message: 'auth.passwordMissingNumber' })
    .regex(/[^A-Za-z0-9]/, { message: 'auth.passwordMissingSpecialCharacter' }),

  /**
   * Full name of user
   * - Must be between 2 and 50 characters
   */
  fullName: z
    .string()
    .min(2, { message: 'auth.fullNameTooShort' })
    .max(50, { message: 'auth.fullNameTooLong' }),
});

/**
 * Type inferred from forgot password schema
 * Used in service/controller layers
 */
export const forgotPasswordSchema = z.object({
  email: z.email('Invalid email address'),
});

/**
 * Validation schema for user registration request
 * - Ensures email format is valid
 * - Enforces strong password rules
 * - Validates full name length constraints
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

  /**
   * Confirm password rules:
   * - Must match the password field
   */
  confirmPassword: z
    .string()
    .min(8, { message: 'auth.passwordTooShort' })
    .max(32, { message: 'auth.passwordTooLong' })
    .regex(/[A-Z]/, { message: 'auth.passwordMissingUppercase' })
    .regex(/[a-z]/, { message: 'auth.passwordMissingLowercase' })
    .regex(/[0-9]/, { message: 'auth.passwordMissingNumber' })
    .regex(/[^A-Za-z0-9]/, { message: 'auth.passwordMissingSpecialCharacter' }),
});

/**
 * Type definitions for form values based on the validation schemas
 * - RegisterForm: Values for user registration form
 * - LoginForm: Values for user login form
 * - ForgotPasswordForm: Values for forgot password form
 * - ResetPasswordForms: Values for reset password form
 */
export type RegisterForm = z.infer<typeof registerSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
