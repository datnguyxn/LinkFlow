import { roleApi } from '@/lib/apis/role.api';
import { ApiResponse } from '@/types/api.type';
import { WorkspaceRole } from '@/types/workspace.type';

class RoleService {
    /**
     * Get all roles
     */
    async getAll(): Promise<ApiResponse<WorkspaceRole[]>> {
        const response = await roleApi.getAll();
        return response.data;
    }
}

export const roleService = new RoleService();