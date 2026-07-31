import { activityLogApi } from '@/lib/apis/activity-log.api';

class ActivityLogService {
  async getAllByWorkspaceId(workspaceId: string) {
    const response = await activityLogApi.getAllByWorkspaceId(workspaceId);
    return response.data.data;
  }
}

export const activityLogService = new ActivityLogService();
