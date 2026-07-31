import { prisma } from '../prisma.ts';

export async function verifyUser(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error(`User with email ${email} not found`);
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: true },
  });

  return user;
}
