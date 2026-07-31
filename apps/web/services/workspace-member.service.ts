import { workspaceApi } from '@/lib/apis/workspace.api';

class WorkspaceMemberService {
  async getAll(workspaceId: string, page?: number, limit?: number, search?: string) {
    const response = await workspaceApi.getAllMembers(workspaceId, page, limit, search);

    return response.data.data;
  }

  async getById(
    workspaceId: string,
    memberId: string,
  ) {
    const response = await workspaceApi.getMemberById(workspaceId, memberId);

    return response.data.data;
  }

  leaveWorkspace(workspaceId: string) {
    return workspaceApi.leaveWorkspace(workspaceId);
  }

  removeMember(workspaceId: string, memberId: string) {
    return workspaceApi.removeMember(workspaceId, memberId);
  }

  transferOwnership(workspaceId: string, newOwnerId: string) {
    return workspaceApi.transferOwnership(workspaceId, newOwnerId);
  }

  updateMemberRole(workspaceId: string, memberId: string, roleId: string) {
    return workspaceApi.updateMemberRole(workspaceId, memberId, roleId);
  }

};

export const workspaceMemberService = new WorkspaceMemberService();