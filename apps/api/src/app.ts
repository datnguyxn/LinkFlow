import Fastify from 'fastify';
import { createLogger } from '@linkflow/logger';
import { healthRoutes } from './modules/health/index.js';
import { routes } from './routes/index.js';
import { config } from './config/env/index.ts';
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
  multipartPlugin,
  errorPlugin,
  staticPlugin
}
  from './plugins/index.ts';
import { prismaPlugin } from './infrastructure/database/index.ts';
import { rabbitMQPlugin } from "./infrastructure/queue/index.ts";
import { redisPlugin } from "./infrastructure/cache/index.ts";
import { registerWorkers } from './bootstrap/workers.ts';

export async function buildApp() {
  await registerI18n();

  const app = Fastify({
    logger: createLogger(process.env.NODE_ENV === config.NODE_ENV),
    trustProxy: true,
  });

  await app.register(rabbitMQPlugin);
  await app.register(redisPlugin);

  await registerWorkers();

  await app.register(swaggerPlugin);
  await app.register(corsPlugin);
  await app.register(helmetPlugin);
  await app.register(sensiblePlugin);
  await app.register(prismaPlugin);

  await app.register(cookiePlugin);
  await app.register(jwtPlugin);
  await app.register(rateLimitPlugin);
  await app.register(multipartPlugin);
  await app.register(errorPlugin);
  await app.register(staticPlugin);

  await app.register(languagePlugin);

  await app.register(routes, {
    prefix: config.API_PREFIX,
  });
  await app.register(healthRoutes);

  return app;
}
