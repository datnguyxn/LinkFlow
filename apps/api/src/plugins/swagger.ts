import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

export default fp(async (app) => {
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'LinkFlow API',
        version: '1.0.0',
        description: 'LinkFlow URL Shortener API',
      },
    },
  });

  await app.register(swaggerUI, {
    routePrefix: '/docs',
  });
});