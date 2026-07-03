import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";

export default fp(async (app) => {
  await app.register(swagger, {
    openapi: {
      openapi: "3.0.3",
      info: {
        title: "LinkFlow API",
        description: "REST API documentation",
        version: "1.0.0",
      },

      servers: [
        {
          url: "http://localhost:3000",
          description: "Development",
        },
      ],

      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  });

  await app.register(swaggerUI, {
    routePrefix: "/docs",
  });
});