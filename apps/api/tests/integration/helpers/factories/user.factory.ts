// tests/integration/helpers/factories/user.factory.ts

import { prisma } from '../prisma.ts';
import bcrypt from 'bcrypt';

export async function createUser() {
  const password = 'Password@123';

  const user = await prisma.user.create({
    data: {
      email: `test-${Date.now()}@gmail.com`,
      fullName: 'Test User',
      passwordHash: await bcrypt.hash(password, 10),
    },
  });

  return {
    user,
    password,
  };
}