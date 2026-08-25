import { redis } from '../../infrastructure/cache/index.ts';
import { consumer } from '../../infrastructure/queue/index.ts';
import {
  RABBITMQ_EXCHANGE,
  RABBITMQ_QUEUE,
  RABBITMQ_ROUTING_KEY,
} from '../../common/constants/index.ts';
import type { 
    UrlCreatedEvent,
    UrlUpdatedEvent,
    UrlDeletedEvent,
} from '../../events/index.ts';

/**
 * UrlCacheWorker is responsible for consuming URL-related events from RabbitMQ and caching the URL data in Redis.
 */
export class UrlCacheWorker {
    // The constructor takes a RedisService instance as a parameter, which is used to interact with Redis.
    constructor(private readonly redisService: typeof redis) {}

    // Start the worker to consume URL created events and cache the URL data in Redis
    async start() {
        // Consume URL created events and cache the URL data in Redis
        await consumer.consume(
            RABBITMQ_EXCHANGE.URL,
            RABBITMQ_ROUTING_KEY.URL_CREATED,
            RABBITMQ_QUEUE.CACHE_URL_CREATED,

            async (event: UrlCreatedEvent) => {
                const cacheKey = `url:${event.id}`;
                const cacheValue = JSON.stringify({
                    workspaceId: event.workspaceId,
                    userId: event.userId,
                    shortCode: event.shortCode,
                    urlId: event.id,
                    originalUrl: event.originalUrl,
                    createdAt: event.createdAt,
                });

                await this.redisService.getClient().set(cacheKey, cacheValue);
                console.log(`Cached URL data for URL ID: ${event.id}`);
            },
        );

        // Consume URL updated events and update the cached URL data in Redis
        await consumer.consume(
            RABBITMQ_EXCHANGE.URL,
            RABBITMQ_ROUTING_KEY.URL_UPDATED,
            RABBITMQ_QUEUE.CACHE_URL_UPDATED,

            async (event: UrlUpdatedEvent) => {
                const cacheKey = `url:${event.id}`;
                const cacheValue = JSON.stringify({
                    workspaceId: event.workspaceId,
                    userId: event.userId,
                    shortCode: event.shortCode,
                    urlId: event.id,
                    originalUrl: event.originalUrl,
                    updatedAt: event.updatedAt,
                });

                await this.redisService.getClient().set(cacheKey, cacheValue);
                console.log(`Updated cached URL data for URL ID: ${event.id}`);
            },
        );

        // Consume URL deleted events and remove the cached URL data from Redis
        await consumer.consume(
            RABBITMQ_EXCHANGE.URL,
            RABBITMQ_ROUTING_KEY.URL_DELETED,
            RABBITMQ_QUEUE.CACHE_URL_DELETED,

            async (event: UrlDeletedEvent) => {
                const cacheKey = `url:${event.id}`;
                await this.redisService.getClient().del(cacheKey);
                console.log(`Deleted cached URL data for URL ID: ${event.id}`);
            },
        );
    }
}