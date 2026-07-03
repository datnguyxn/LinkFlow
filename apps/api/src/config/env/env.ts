import { envSchema } from './env.schema.js';

export function loadEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error(result.error.format());
    process.exit(1);
  }

  return result.data;
}