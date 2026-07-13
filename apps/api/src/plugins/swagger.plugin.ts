import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { ROUTE, AUTH, HTTP_STATUS } from '../common/constants/index.ts';
import { config } from '../config/env/index.ts';

export default fp(async (app) => {
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: `${config.NAME} API`,
        description: 'REST API documentation',
        version: '1.0.0',
      },

      servers: [
        {
          url: `${config.BASE_URL}:${config.PORT}`,
          description:
            config.NODE_ENV === 'production' ? 'Production server' : 'Development server',
        },
      ],

      components: {
        securitySchemes: {
          bearerAuth: {
            type: HTTP_STATUS.HTTP,
            scheme: AUTH.BEARER,
            bearerFormat: AUTH.JWT,
          },
        },
      },
    },
  });

  await app.register(swaggerUI, {
    routePrefix: ROUTE.DOCS,
  });
});
