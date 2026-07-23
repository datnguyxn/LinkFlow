import { Prisma } from '@prisma/client';

export const workspaceWithRole = Prisma.validator<Prisma.WorkspaceDefaultArgs>()({
  include: {
    members: {
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    },
  },
});

export type WorkspaceWithRole =
  Prisma.WorkspaceGetPayload<typeof workspaceWithRole>;