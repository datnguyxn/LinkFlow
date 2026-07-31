import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

dotenv.config({
  path: '.env.test',
  override: true,
});

export default defineConfig({
  test: {
    globals: true,

    environment: 'node',

    setupFiles: ['./tests/integration/setup.ts'],

    include: ['tests/integration/**/*.spec.ts'],

    testTimeout: 30000,

    hookTimeout: 30000,

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage/integration',
    },
  },
});
