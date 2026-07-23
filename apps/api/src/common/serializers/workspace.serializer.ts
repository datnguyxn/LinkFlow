import type { WorkspaceWithRole } from '../../modules/workspace/types/workspace.type.ts';
import type { Workspace } from '@prisma/client';

export class WorkspaceSerializer {
  static serializeWithMember(workspace: WorkspaceWithRole) {
    const member = workspace.members[0];

    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      logoUrl: workspace.logoUrl,

      role: {
        id: member.role.id,
        name: member.role.name,
      },

      permissions: member.role.permissions.map(
        (item) => item.permission.name,
      ),

      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  }

  static serialize(workspace: Workspace) {
    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      logoUrl: workspace.logoUrl,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  }

  static serializeMany(workspaces: Workspace[]) {
    return workspaces.map(this.serialize);
  }
}