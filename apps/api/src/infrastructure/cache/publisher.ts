import type { RedisClientType } from 'redis';

import { redis } from './redis.ts';

export class RedisPublisher {
  private client: RedisClientType;

  constructor() {
    this.client = redis
      .getClient()
      .duplicate();

    this.client.on('error', (error) => {
      console.error(
        '❌ Redis publisher error:',
        error,
      );
    });
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async publish(
    channel: string,
    message: unknown,
  ) {
    await this.client.publish(
      channel,
      JSON.stringify(message),
    );
  }

  async disconnect() {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }
}

export const redisPublisher =
  new RedisPublisher();
