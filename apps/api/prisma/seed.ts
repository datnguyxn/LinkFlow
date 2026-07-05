import { PrismaClient, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 10);

  await prisma.user.upsert({
    where: {
      email: 'admin@linkflow.com',
    },
    update: {},
    create: {
      email: 'admin@linkflow.com',
      username: 'admin',
      passwordHash,
      fullName: 'System Administrator',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      theme: false,
      language: 'en',
      timezone: 'UTC',
    },
  });

  console.log('✅ Seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function main() {
//   const roles = [
//     {
//       name: "OWNER",
//       description: "Workspace owner",
//     },
//     {
//       name: "ADMIN",
//       description: "Workspace administrator",
//     },
//     {
//       name: "MEMBER",
//       description: "Workspace member",
//     },
//   ];

//   for (const role of roles) {
//     await prisma.role.upsert({
//       where: {
//         name: role.name,
//       },
//       update: {},
//       create: role,
//     });
//   }

//   console.log("✅ Default roles seeded");
// }

// main()
//   .catch(console.error)
//   .finally(async () => {
//     await prisma.$disconnect();
//   });