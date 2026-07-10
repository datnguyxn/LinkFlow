import { envSchema, type Env } from "./env.schema";

/**
 * Load and validate frontend environment variables.
 * Only NEXT_PUBLIC_* variables are exposed to the browser.
 */
export function loadEnv(): Env {
    const result = envSchema.safeParse({
        NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_LOGIN_URL: process.env.NEXT_PUBLIC_LOGIN_URL,
        NEXT_PUBLIC_REGISTER_URL: process.env.NEXT_PUBLIC_REGISTER_URL,
        NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN,
        NEXT_PUBLIC_ENABLE_GITHUB_LOGIN: process.env.NEXT_PUBLIC_ENABLE_GITHUB_LOGIN,
        NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
        NEXT_PUBLIC_ENABLE_DARK_MODE: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE,
        NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
        NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
        NEXT_PUBLIC_MAX_FILE_SIZE: process.env.NEXT_PUBLIC_MAX_FILE_SIZE,
        NEXT_PUBLIC_DEFAULT_PAGE_SIZE: process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE,
        NEXT_PUBLIC_DEFAULT_TIMEZONE: process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE,
        NEXT_PUBLIC_DEFAULT_LANGUAGE: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE,
        NEXT_PUBLIC_QR_SIZE: process.env.NEXT_PUBLIC_QR_SIZE,
    });

    if (!result.success) {
        return {} as Env; // Return an empty object to avoid runtime errors
    }

    return result.data;
}