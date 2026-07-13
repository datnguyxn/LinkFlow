import fp from 'fastify-plugin';
import { rabbitMQ } from './rabbitmq.ts';

export default fp(async (app) => {
  await rabbitMQ.connect();

  app.decorate('rabbitMQ', rabbitMQ);

  app.addHook('onClose', async () => {
    await rabbitMQ.close();
  });
});
