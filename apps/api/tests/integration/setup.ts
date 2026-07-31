import { afterAll, beforeAll, beforeEach } from 'vitest';

import { prisma } from './helpers/prisma'; // chỉnh lại theo đường dẫn của bạn
import { cleanDatabase } from './helpers/database';

beforeAll(async () => {

    console.log('Connecting to the test database...');

    const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('Database connection string is not defined in the environment variables.');
    }

    console.log(`Using database connection string: ${connectionString}`);

  await prisma.$connect();
});

beforeEach(async () => {
    await cleanDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});