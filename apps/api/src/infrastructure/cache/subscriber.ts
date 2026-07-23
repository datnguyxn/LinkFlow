import type { RedisClientType } from 'redis';

import { redis } from './redis.ts';

class RedisSubscriber {
  private client: RedisClientType;

  constructor() {
    this.client = redis
      .getClient()
      .duplicate();

    this.client.on('error', (error) => {
      console.error(
        '❌ Redis subscriber error:',
        error,
      );
    });
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async subscribe(
    channel: string,
    handler: (message: string) => void,
  ) {
    await this.client.subscribe(
      channel,
      handler,
    );
  }

  async unsubscribe(channel: string) {
    await this.client.unsubscribe(
      channel,
    );
  }

  async disconnect() {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }
}

export const redisSubscriber =
  new RedisSubscriber();