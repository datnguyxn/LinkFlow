import Fastify from 'fastify';
import { createLogger } from '@linkflow/logger';
import { healthRoutes } from './modules/health/index.js';
import { routes } from './routes/index.js';
import { loadEnv } from './config/env/index.ts';
import {
  sensiblePlugin,
  languagePlugin,
  registerI18n,
  corsPlugin,
  helmetPlugin,
  swaggerPlugin,
  cookiePlugin,
  jwtPlugin,
  rateLimitPlugin,
  multipartPlugin
}
  from './plugins/index.ts';
import { prismaPlugin } from './infrastructure/database/index.ts';

const env = loadEnv();

export async function buildApp() {
  await registerI18n();

  const app = Fastify({
    logger: createLogger(process.env.NODE_ENV === env.NODE_ENV),
  });

  await app.register(swaggerPlugin);
  await app.register(corsPlugin);
  await app.register(helmetPlugin);
  await app.register(sensiblePlugin);
  await app.register(prismaPlugin);

  await app.register(cookiePlugin);
  await app.register(jwtPlugin);
  await app.register(rateLimitPlugin);
  await app.register(multipartPlugin);


  await app.register(languagePlugin);

  await app.register(routes, {
    prefix: env.API_PREFIX,
  });
  await app.register(healthRoutes);

  return app;
}
