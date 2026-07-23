// This file serves as an index for all event interfaces in the application. It re-exports the event interfaces from their respective files, allowing for easier imports elsewhere in the codebase.

// Auth-related events
export * from './auth/user-registered.event.ts';
export * from './auth/user-logout.event.ts';
export * from './auth/user-login.event.ts';
export * from './auth/user-reset-password.event.ts';
export * from './auth/auth-audit.event.ts';
export * from './auth/revoke-session.event.ts';

// Admin-user-related events
export * from './admin/user/user-action.event.ts';

// User-related events
export * from './user/user-update.event.ts';
export * from './user/user-delete.event.ts';
export * from './user/user-upload-avatar.event.ts';
export * from './user/user-change-password.event.ts';

// Workspace-related events
export * from './workspace/workspace-create.event.ts';
export * from './workspace/workspace-update.event.ts';
export * from './workspace/workspace-delete.event.ts';

// Workspace invitation-related events
export * from './workspace/workspace-invitation-create.event.ts';
export * from './workspace/workspace-invitation-update.event.ts';
