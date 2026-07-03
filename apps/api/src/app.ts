import Fastify from 'fastify';
import { createLogger } from '@linkflow/logger';
import { healthRoutes } from './modules/health/index.js';

import { corsPlugin, helmetPlugin, sensiblePlugin, swaggerPlugin, prismaPlugin } from './plugins/index.js';

export async function buildApp() {
  const app = Fastify({
    logger: createLogger(process.env.NODE_ENV === 'production'),
  });

  await app.register(swaggerPlugin);
  await app.register(corsPlugin);
  await app.register(helmetPlugin);
  await app.register(sensiblePlugin);
  await app.register(prismaPlugin);

  
  await app.register(healthRoutes);

  return app;
}
