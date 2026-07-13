import { createClient, type RedisClientType } from 'redis';
import { config } from '../../config/env/index.ts';

class RedisService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: config.REDIS_URL,
    });

    this.client.on('connect', () => {});

    this.client.on('ready', () => {
      console.log('✅ Redis connected');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });

    this.client.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });

    this.client.on('end', () => {
      console.log('🔴 Redis disconnected');
    });
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async disconnect() {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }
}

export const redis = new RedisService();
