import { z } from 'zod';
import i18n from "../../../plugins/i18n.plugin.ts";


export const registerSchema = z.object({
    email: z.string().email({ message: i18n.t('auth.invalidEmail') }),
    username: z.string().min(3, { message: i18n.t('auth.usernameTooShort') }),
    password: z
        .string()
        .min(8, { message: i18n.t('auth.passwordTooShort') })
        .max(32, { message: i18n.t('auth.passwordTooLong') })
        .regex(/[A-Z]/, { message: i18n.t('auth.passwordMissingUppercase') })
        .regex(/[a-z]/, { message: i18n.t('auth.passwordMissingLowercase') })
        .regex(/[0-9]/, { message: i18n.t('auth.passwordMissingNumber') })
        .regex(/[^A-Za-z0-9]/, { message: i18n.t('auth.passwordMissingSpecialCharacter') }),

    fullName: z
        .string()
        .min(2, { message: i18n.t('auth.fullNameTooShort') })
        .max(50, { message: i18n.t('auth.fullNameTooLong') }),
});