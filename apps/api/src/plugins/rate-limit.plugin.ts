import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';

export default fp(async (fastify) => {
  await fastify.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder(request, context) {
      return {
        success: false,
        statusCode: 429,
        message: request.t('request.manyRequests'),
        errors: [
          {
            code: 'RATE_LIMIT_EXCEEDED',
            message: request.t('request.retryLater', { after: context.after }),
          },
        ],
      };
    },
  });
});
