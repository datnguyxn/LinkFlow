import dotenv from 'dotenv';
import { beforeEach, afterEach, vi } from 'vitest';

dotenv.config({
  path: '.env.test',
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
