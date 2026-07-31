export const WORKSPACE_PERMISSION = {
    // Workspace
    WORKSPACE_READ: 'workspace.read',
    WORKSPACE_CREATE: 'workspace.create',
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
    URL_CREATE: 'url.create',
    URL_READ: 'url.read',
    URL_UPDATE: 'url.update',
    URL_DELETE: 'url.delete',

    // Tags
    TAG_CREATE: 'tag.create',
    TAG_READ: 'tag.read',
    TAG_UPDATE: 'tag.update',
    TAG_DELETE: 'tag.delete',

    // API Keys
    API_KEY_CREATE: 'apikey.create',
    API_KEY_READ: 'apikey.read',
    API_KEY_REVOKE: 'apikey.revoke',

    // QR Codes
    QRCODE_CREATE: 'qrcode.create',
    QRCODE_READ: 'qrcode.read',
    QRCODE_UPDATE: 'qrcode.update',
    QRCODE_DELETE: 'qrcode.delete',

    // Analytics
    ANALYTICS_READ: 'analytics.read',
    ANALYTICS_EXPORT: 'analytics.export',
    ANALYTICS_DELETE: 'analytics.delete',

    // Audit Logs
    AUDIT_READ: 'audit.read',

    // Billing
    BILLING_READ: 'billing.read',
    BILLING_UPDATE: 'billing.update',
    BILLING_CANCEL: 'billing.cancel',
} as const;

export type WorkspacePermission = (typeof WORKSPACE_PERMISSION)[keyof typeof WORKSPACE_PERMISSION];
