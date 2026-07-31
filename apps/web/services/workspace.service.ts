import { workspaceApi } from '@/lib/apis/workspace.api';
import { Workspace, WorkspaceDetail } from '@/types/workspace.type';

class WorkspaceService {
  /**
   * Get all workspaces
   */
  async getAll(): Promise<Workspace[]> {
    const response = await workspaceApi.getAll();
    return response.data.data;
  }

  /**
   * Get workspace by id
   */
  async getById(id: string): Promise<WorkspaceDetail> {
    const response = await workspaceApi.getById(id);
    return response.data.data;
  }

  /**
   * Create a new workspace
   */
  async create(data: { name: string }): Promise<Workspace> {
    const response = await workspaceApi.create(data);
    return response.data.data;
  }

  /**
   * Update workspace
   */
  async update(id: string, data: { name: string }): Promise<WorkspaceDetail> {
    const response = await workspaceApi.update(id, data);
    return response.data.data;
  }

  /**
   * Update workspace logo
   */
  async updateLogo(
    id: string,
    file?: File | null,
    logoUrl?: string | null,
  ): Promise<WorkspaceDetail> {
    const response = await workspaceApi.updateLogo(id, file, logoUrl);
    return response.data.data;
  }

  /**
   * Delete workspace logo
   */
  async deleteLogo(id: string): Promise<void> {
    await workspaceApi.deleteLogo(id);
  }

  /**
   * Delete a workspace
   */
  async delete(id: string): Promise<void> {
    await workspaceApi.delete(id);
  }
}

export const workspaceService = new WorkspaceService();
