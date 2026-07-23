import { z } from 'zod';

export const workspaceValidator = z.object({
    name: z.string().min(2).max(100),
    slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
    logoUrl: z.string().url().optional(),
});

export type WorkspaceInput = z.infer<typeof workspaceValidator>;