import type {
  WorkspaceWithRole,
  WorkspaceWithRoleAndUser,
} from '../../modules/workspace/types/workspace.type.ts';

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

      permissions: member.role.permissions.map((item) => item.permission.name),

      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  }

  static serialize(workspace: WorkspaceWithRoleAndUser) {
    const member = workspace.members[0];

    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      logoUrl: workspace.logoUrl,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,

      role: member?.role
        ? {
            id: member.role.id,
            name: member.role.name,
            description: member.role.description,
          }
        : null,
    };
  }
  static serializeMany(workspaces: WorkspaceWithRoleAndUser[]) {
    return workspaces.map((workspace) => this.serialize(workspace));
  }
}
