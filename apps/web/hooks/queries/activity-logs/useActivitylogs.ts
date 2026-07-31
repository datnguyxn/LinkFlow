import { useQuery } from '@tanstack/react-query';

import { activityLogService } from '@/services/activity-log.service';

export const activityLogKeys = {
  all: ['activity-logs'] as const,

  workspace: (workspaceId: string) => [...activityLogKeys.all, workspaceId] as const,
};

export function useActivityLogs(workspaceId: string, page = 1, limit = 5, enabled = true) {
  return useQuery({
    queryKey: activityLogKeys.workspace(workspaceId),

    queryFn: () => activityLogService.getAllByWorkspaceId(workspaceId),

    enabled: enabled && Boolean(workspaceId),

    staleTime: 5 * 60 * 1000,
  });
}
