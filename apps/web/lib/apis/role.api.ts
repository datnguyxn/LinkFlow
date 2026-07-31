import { api } from '@/lib/axios';
import { ApiResponse } from '@/types/api.type';
import { WorkspaceRole } from '@/types/workspace.type';

const PREFIX = '/api/v1';

export const roleApi = {
  /**
   * Get all roles
   */
  getAll() {
    return api.get<ApiResponse<WorkspaceRole[]>>(`${PREFIX}/roles`);
  },
};