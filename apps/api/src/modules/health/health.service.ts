import { loadEnv } from '../../config/env/index.js';

const env = loadEnv();

export class HealthService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      version: '1.0.0',
    };
  }
}
