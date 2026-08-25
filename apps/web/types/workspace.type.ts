import { Pagination } from './pagination.type';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  createdAt: string;
  role: WorkspaceRole;
}

export interface WorkspaceRole {
  id: string;
  name: string;
}

export interface WorkspaceDetail {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;

  role: WorkspaceRole;
  permissions: string[];

  createdAt: string;
  updatedAt: string;
}

/* =========================================================
 * Workspace Members
 * ======================================================= */

export interface WorkspaceMemberUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
}

export type WorkspaceMemberStatus = 'ACTIVE' | 'LEFT' | 'REMOVED';

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  roleId: string;

  status: WorkspaceMemberStatus;

  createdAt: string;
  joinedAt: string;
  updatedAt: string;
  deletedAt: string | null;

  user: WorkspaceMemberUser;
  role: WorkspaceRole;
}

export interface WorkspaceMemberDetail extends WorkspaceMember {
  workspace: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
}

export interface WorkspaceMemberSummary {
  total: number;
  active: number;
  left: number;
  removed: number;
}

export interface WorkspaceMembersResponse {
  members: WorkspaceMember[];
  summary: WorkspaceMemberSummary;
  pagination: Pagination;
}

/* =========================================================
 * Workspace Invitations
 * ======================================================= */

export type WorkspaceInvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REJECTED' | 'REVOKED';

export interface WorkspaceInvitationUser {
  id: string;
  fullName: string;
  email: string;
}

export interface WorkspaceInvitationRole {
  id: string;
  name: string;
}

export interface WorkspaceInvitation {
  id: string;

  email: string;
  token: string;

  status: WorkspaceInvitationStatus;

  expiresAt: string;
  createdAt: string;

  inviter: WorkspaceInvitationUser;

  workspace: {
    slug: string;
  };

  /**
   * null nếu email được invite
   * chưa có tài khoản trong hệ thống.
   */
  user: WorkspaceInvitationUser | null;

  role: WorkspaceInvitationRole;
}

export interface WorkspaceInvitationSummary {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  expired: number;
}

export interface WorkspaceInvitationListResponse {
  invitations: WorkspaceInvitation[];
  summary: WorkspaceInvitationSummary;
  pagination: Pagination;
}