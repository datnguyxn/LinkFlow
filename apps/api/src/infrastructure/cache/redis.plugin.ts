import fp from 'fastify-plugin';
import { redis } from './redis.ts';
import { redisSubscriber } from './subscriber.ts';

export default fp(async (app) => {
  await redis.connect();

  await redisSubscriber.connect();

  app.decorate('redis', redis);

  app.addHook('onClose', async () => {
    await redis.disconnect();
    await redisSubscriber.disconnect();
  });
});
