import { z } from "zod";

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

    remember: z.boolean(),
});

export type LoginForm = z.infer<typeof loginSchema>;