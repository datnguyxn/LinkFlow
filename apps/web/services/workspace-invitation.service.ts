import { workspaceApi } from '@/lib/apis/workspace.api';

class WorkspaceInvitationService {
  /**
   * Invite a member to a workspace
   */
  inviteMember(workspaceId: string, email: string, roleId: string) {
    return workspaceApi.inviteMember(workspaceId, { email, roleId });
  }

  /**
   * Get all invitations of a workspace
   */
  getAllInvitations(workspaceId: string, page: number, limit: number, search?: string) {
    return workspaceApi.getAllInvitations(workspaceId, page, limit, search);
  }

  /**
   * Get an invitation of a workspace by invitation ID
   */
  getInvitationById(workspaceId: string, invitationId: string) {
    return workspaceApi.getInvitationById(workspaceId, invitationId);
  }

  /**
   * Accept an invitation to a workspace
   */
  async acceptInvitation(workspaceId: string, invitationId: string, token: string) {
    const response = await workspaceApi.acceptInvitation(workspaceId, invitationId, token);
    return response.data.data;
  }

  /**
   * Validate an invitation token for a workspace invitation
   */
  async validateInvitation(workspaceId: string, token: string) {
    const response = await workspaceApi.validateInvitation(workspaceId, token);
    return response.data;
  }

  /**
   * Decline an invitation to a workspace
   */
  declineInvitation(workspaceId: string, token: string) {
    return workspaceApi.declineInvitation(workspaceId, token);
  }

  /**
   * Revoke an invitation to a workspace
   */
  revokeInvitation(workspaceId: string, invitationId: string) {
    return workspaceApi.revokeInvitation(workspaceId, invitationId);
  }
}

export const workspaceInvitationService = new WorkspaceInvitationService();
