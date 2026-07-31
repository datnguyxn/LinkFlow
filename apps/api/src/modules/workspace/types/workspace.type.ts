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

export const workspaceWithRoleAndUser = Prisma.validator<Prisma.WorkspaceDefaultArgs>()({
  include: {
    members: {
      where: {
        userId: undefined, // This will be replaced with the actual userId when querying
      },
      select: {
        role: true, // Include the role information for the member
      }
    }
  }
});

export type WorkspaceWithRole = Prisma.WorkspaceGetPayload<typeof workspaceWithRole>;

export type WorkspaceWithRoleAndUser = Prisma.WorkspaceGetPayload<typeof workspaceWithRoleAndUser>;
