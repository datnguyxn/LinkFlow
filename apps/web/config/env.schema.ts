import { z } from 'zod';

/**
 * Environment variable schema for the application.
 * This schema defines the expected structure and types of environment variables.
 */
export const envSchema = z.object({
    // Environment and application settings
    NEXT_PUBLIC_APP_NAME: z.string(),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_APP_ENV: z.enum(['development', 'test', 'production']),

    NEXT_PUBLIC_API_URL: z.string(),

    NEXT_PUBLIC_LOGIN_URL: z.string(),
    NEXT_PUBLIC_REGISTER_URL: z.string(),

    NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN: z.coerce.boolean(),
    NEXT_PUBLIC_ENABLE_GITHUB_LOGIN: z.coerce.boolean(),
    NEXT_PUBLIC_ENABLE_ANALYTICS: z.coerce.boolean(),
    NEXT_PUBLIC_ENABLE_DARK_MODE: z.coerce.boolean(),


    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string(),


    NEXT_PUBLIC_MAX_FILE_SIZE: z.coerce.number().positive(),


    NEXT_PUBLIC_DEFAULT_PAGE_SIZE: z.coerce.number().positive(),


    NEXT_PUBLIC_DEFAULT_TIMEZONE: z.string(),


    NEXT_PUBLIC_DEFAULT_LANGUAGE: z.string(),

    NEXT_PUBLIC_QR_SIZE: z.coerce.number().positive()
});

export type Env = z.infer<typeof envSchema>;