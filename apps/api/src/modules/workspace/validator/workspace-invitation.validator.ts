import { z } from 'zod';

export const createWorkspaceInvitationSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email(),

  roleId: z
    .string()
    .uuid(),
});

export type CreateWorkspaceInvitationInput =
  z.infer<typeof createWorkspaceInvitationSchema>;