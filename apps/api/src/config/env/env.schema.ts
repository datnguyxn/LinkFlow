import { z } from 'zod';

/**
 * Environment variable schema for the application.
 * This schema defines the expected structure and types of environment variables.
 */
export const envSchema = z.object({
  // Environment and application settings
  NODE_ENV: z.enum(['development', 'test', 'production']),
  NAME: z.string(),
  PORT: z.coerce.number(),
  API_PREFIX: z.string(),
  BASE_URL: z.string(),

  // Database configuration
  DATABASE_URL: z.string().optional(),

  // Supabase configuration
  SUPABASE_URL: z.string().optional(),
  SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_SECRET_KEY: z.string().optional(),
  SUPABASE_JWKS_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),

  // JWT configuration
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string(),
  JWT_ACCESS_EXPIRES_MS: z.coerce.number(),
  JWT_REFRESH_EXPIRES_MS: z.coerce.number(),
  JWT_REFRESH_REMEMBER_EXPIRES_MS: z.coerce.number(),

  // Redis configuration
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_URL: z.string(),

  // RabbitMQ configuration
  RABBITMQ_URL: z.string(),

  // MinIO configuration
  MINIO_ENDPOINT: z.string().optional(),
  MINIO_PORT: z.coerce.number().optional(),
  MINIO_ACCESS_KEY: z.string().optional(),
  MINIO_SECRET_KEY: z.string().optional(),
  MINIO_BUCKET: z.string().optional(),

  // Google OAuth configuration
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string(),
  GOOGLE_AUTHORIZATION_URL: z.string(),
  GOOGLE_TOKEN_URL: z.string(),
  GOOGLE_USER_INFO_URL: z.string(),

  // SMTP configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  SMTP_SECURE: z.string().optional(),

  // Client URL configuration
  CLIENT_URL: z.string(),

  // Cookie secret for signing cookies
  COOKIE_SECRET: z.string(),
});

// Infer the TypeScript type for the environment variables based on the schema
export type Env = z.infer<typeof envSchema>;
