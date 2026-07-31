import { api } from '@/lib/axios';
import { ApiResponse } from '@/types/api.type';
import {
  Workspace,
  WorkspaceDetail,
  WorkspaceInvitation,
  WorkspaceInvitationListResponse,
  WorkspaceMember,
  WorkspaceMemberDetail,
  WorkspaceMembersResponse,
} from '@/types/workspace.type';

const PREFIX = '/api/v1';

export const workspaceApi = {
  /*****************************************************************************
   * Workspaces
   ****************************************************************************/
  /**
   * Get all workspaces
   */
  getAll() {
    return api.get<ApiResponse<Workspace[]>>(`${PREFIX}/workspaces`);
  },

  /**
   * Get workspace by id
   */
  getById(id: string) {
    return api.get<ApiResponse<WorkspaceDetail>>(`${PREFIX}/workspaces/${id}`);
  },

  /**
   * Create a new workspace
   */
  create(data: { name: string }) {
    return api.post<ApiResponse<Workspace>>(`${PREFIX}/workspaces`, data);
  },

  /**
   * Update workspace
   */
  update(id: string, data: { name: string }) {
    return api.patch<ApiResponse<WorkspaceDetail>>(`${PREFIX}/workspaces/${id}`, data);
  },

  /**
   * Update workspace logo
   */
  updateLogo(id: string, file?: File | null, logoUrl?: string | null) {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      return api.patch<ApiResponse<WorkspaceDetail>>(`${PREFIX}/workspaces/${id}/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.patch<ApiResponse<WorkspaceDetail>>(`${PREFIX}/workspaces/${id}/logo`, { logoUrl });
  },

  /**
   * Delete workspace logo
   */
  deleteLogo(id: string) {
    return api.delete<ApiResponse<null>>(`${PREFIX}/workspaces/${id}/logo`);
  },

  /**
   * Delete a workspace
   */
  delete(id: string) {
    return api.delete<ApiResponse<null>>(`${PREFIX}/workspaces/${id}`);
  },

  /*****************************************************************************
   * Workspace Members
   ****************************************************************************/

  /**
   * Get all members of a workspace
   */
  getAllMembers(workspaceId: string, page?: number, limit?: number, search?: string) {
    const searchParam = search ? `&search=${search}` : '';
    return api.get<ApiResponse<WorkspaceMembersResponse>>(
      `${PREFIX}/workspaces/${workspaceId}/members?page=${page || 1}&limit=${limit || 10}${searchParam}`,
    );
  },

  /**
   * Get a member of a workspace by member ID
   */
  getMemberById(workspaceId: string, memberId: string) {
    return api.get<ApiResponse<WorkspaceMemberDetail>>(
      `${PREFIX}/workspaces/${workspaceId}/members/${memberId}`,
    );
  },

  /**
   * Leave a workspace
   */
  leaveWorkspace(workspaceId: string) {
    return api.delete<ApiResponse<null>>(`${PREFIX}/workspaces/${workspaceId}/members/me`);
  },

  /**
   * Remove a member from a workspace
   */
  removeMember(workspaceId: string, memberId: string) {
    return api.delete<ApiResponse<null>>(`${PREFIX}/workspaces/${workspaceId}/members/${memberId}`);
  },

  /**
   * Transfer ownership of a workspace to another member
   */
  transferOwnership(workspaceId: string, newOwnerId: string) {
    return api.patch<ApiResponse<null>>(`${PREFIX}/workspaces/${workspaceId}/members/ownership`, {
      newOwnerId,
    });
  },

  /**
   * Update a member's role in a workspace
   */
  updateMemberRole(workspaceId: string, memberId: string, newRoleId: string) {
    return api.patch<ApiResponse<WorkspaceMemberDetail>>(
      `${PREFIX}/workspaces/${workspaceId}/members/${memberId}`,
      { newRoleId },
    );
  },

  /*****************************************************************************
   * Workspace Invitations
   ****************************************************************************/
  /**
   * Invite a member to a workspace
   */
  inviteMember(workspaceId: string, data: { email: string; roleId: string }) {
    return api.post<ApiResponse<WorkspaceInvitation>>(
      `${PREFIX}/workspaces/${workspaceId}/invitations`,
      data,
    );
  },

  /**
   * Get all invitations of a workspace
   */
  getAllInvitations(workspaceId: string, page: number, limit: number, search?: string) {
    const searchParam = search ? `&search=${search}` : '';
    return api.get<ApiResponse<WorkspaceInvitationListResponse>>(
      `${PREFIX}/workspaces/${workspaceId}/invitations?page=${page}&limit=${limit}${searchParam}`,
    );
  },

  /**
   * Get an invitation of a workspace by invitation ID
   */
  getInvitationById(workspaceId: string, invitationId: string) {
    return api.get<ApiResponse<WorkspaceInvitation>>(
      `${PREFIX}/workspaces/${workspaceId}/invitations/${invitationId}`,
    );
  },

  /**
   * Accept an invitation to a workspace
   */
  acceptInvitation(workspaceId: string, invitationId: string, token: string) {
    return api.get<ApiResponse<WorkspaceInvitation>>(
      `${PREFIX}/workspaces/${workspaceId}/invitations/${invitationId}/accept?token=${token}`,
    );
  },

  /**
   * Validate an invitation to a workspace
   */
  validateInvitation(workspaceId: string, token: string) {
    return api.get<ApiResponse<WorkspaceInvitation>>(
      `${PREFIX}/workspaces/${workspaceId}/invitations/validate?token=${token}`,
    );
  },

  /**
   * Decline an invitation to a workspace
   */
  declineInvitation(workspaceId: string, token: string) {
    return api.get<ApiResponse<null>>(
      `${PREFIX}/workspaces/${workspaceId}/invitations/reject?token=${token}`,
    );
  },

  /**
   * Revoke an invitation to a workspace
   */
  revokeInvitation(workspaceId: string, invitationId: string) {
    return api.delete<ApiResponse<null>>(
      `${PREFIX}/workspaces/${workspaceId}/invitations/${invitationId}`,
    );
  },
};
