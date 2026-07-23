export const WORKSPACE_PERMISSION = {
  // Workspace
  WORKSPACE_READ: 'workspace.read',
  WORKSPACE_UPDATE: 'workspace.update',
  WORKSPACE_DELETE: 'workspace.delete',

  // Workspace Members
  MEMBER_READ: 'workspace.member.read',
  MEMBER_INVITE: 'workspace.member.invite',
  MEMBER_UPDATE: 'workspace.member.update',
  MEMBER_REMOVE: 'workspace.member.remove',
  MEMBER_LEAVE: 'workspace.member.leave',

  // Workspace Invitations
  INVITATION_CREATE: 'workspace.invitation.create',
  INVITATION_READ: 'workspace.invitation.read',
  INVITATION_ACCEPT: 'workspace.invitation.accept',
  INVITATION_REJECT: 'workspace.invitation.reject',
  INVITATION_CANCEL: 'workspace.invitation.cancel',

  // URLs
  URL_CREATE: 'workspace.url.create',
  URL_READ: 'workspace.url.read',
  URL_UPDATE: 'workspace.url.update',
  URL_DELETE: 'workspace.url.delete',

  // Tags
  TAG_CREATE: 'workspace.tag.create',
  TAG_READ: 'workspace.tag.read',
  TAG_UPDATE: 'workspace.tag.update',
  TAG_DELETE: 'workspace.tag.delete',

  // API Keys
  API_KEY_CREATE: 'workspace.apiKey.create',
  API_KEY_READ: 'workspace.apiKey.read',
  API_KEY_REVOKE: 'workspace.apiKey.revoke',
} as const;

export type WorkspacePermission = (typeof WORKSPACE_PERMISSION)[keyof typeof WORKSPACE_PERMISSION];
