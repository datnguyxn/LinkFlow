import { api } from '@/lib/axios';
import { ApiResponse } from '@/types/api.type';
import { ActivityLog } from '@/types/activity-logs.type';
const PREFIX = '/api/v1';

export const activityLogApi = {
  getAllByWorkspaceId(workspaceId: string) {
    return api.get<ApiResponse<ActivityLog[]>>(`${PREFIX}/activity-logs/${workspaceId}`);
  },
};
