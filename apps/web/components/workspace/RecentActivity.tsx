'use client';

import {
  Activity,
  Edit3,
  Link2,
  QrCode,
  Settings,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';

import { ActivityLog } from '@/types/activity-logs.type';
import { useActivityLogs } from '@/hooks/queries/activity-logs/useActivitylogs';

interface RecentActivityProps {
  workspaceId: string;
}

const ACTION_CONFIG: Record<
  string,
  {
    title: string;
    description: (activity: ActivityLog) => string;
    icon: React.ElementType;
  }
> = {
  WORKSPACE_UPDATED: {
    title: 'Updated workspace',
    description: (activity) => {
      const fields = activity.metadata?.changedFields;

      if (Array.isArray(fields) && fields.length > 0) {
        return `Changed ${fields.join(', ')}`;
      }

      return 'Workspace configuration updated';
    },
    icon: Settings,
  },

  URL_CREATED: {
    title: 'Created a short link',
    description: () => 'Created a new short link',
    icon: Link2,
  },

  URL_UPDATED: {
    title: 'Updated a short link',
    description: () => 'Short link configuration updated',
    icon: Edit3,
  },

  URL_DELETED: {
    title: 'Deleted a short link',
    description: () => 'A short link was deleted',
    icon: Trash2,
  },

  QR_CODE_CREATED: {
    title: 'Created a QR code',
    description: () => 'Created a new QR code',
    icon: QrCode,
  },

  MEMBER_JOINED: {
    title: 'New member joined',
    description: (activity) =>
      `${activity.user.fullName} joined the workspace`,
    icon: UserPlus,
  },

  MEMBER_INVITED: {
    title: 'Invited a member',
    description: () => 'A new workspace invitation was sent',
    icon: UserPlus,
  },

  MEMBER_REMOVED: {
    title: 'Removed a member',
    description: () => 'A workspace member was removed',
    icon: Users,
  },

  MEMBER_ROLE_UPDATED: {
    title: 'Updated member role',
    description: () => 'A member role was changed',
    icon: Shield,
  },
};

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) {
    return 'Just now';
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year:
      date.getFullYear() !== now.getFullYear()
        ? 'numeric'
        : undefined,
  });
}

function getActivityConfig(action: string) {
  return (
    ACTION_CONFIG[action] ?? {
      title: action
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/^\w/, (char) => char.toUpperCase()),

      description: () => 'Workspace activity',

      icon: Activity,
    }
  );
}

export default function RecentActivity({
  workspaceId,
}: RecentActivityProps) {
  const {
    data,
    isLoading,
    isError,
  } = useActivityLogs(workspaceId);

  const activities = data ?? [];

  return (
    <div
      className="
        flex
        min-h-[320px]
        flex-col
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Recent activity
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Recent activities in this workspace.
          </p>
        </div>

        <Activity className="h-5 w-5 text-slate-400" />
      </div>

      {/* Content */}
      <div className="flex-1">
        {/* Loading */}
        {isLoading && (
          <div className="space-y-0">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="
                  flex
                  items-start
                  gap-4
                  border-b
                  border-slate-100
                  py-4
                  first:pt-0
                  last:border-b-0
                  dark:border-slate-800
                "
              >
                <div
                  className="
                    h-9
                    w-9
                    shrink-0
                    animate-pulse
                    rounded-xl
                    bg-slate-100
                    dark:bg-slate-800
                  "
                />

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />

                  <div className="h-3 w-56 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                </div>

                <div className="h-3 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!isLoading && isError && (
          <div className="flex h-full items-center justify-center py-8 text-center text-sm text-slate-500">
            Failed to load recent activity.
          </div>
        )}

        {/* Empty */}
        {!isLoading &&
          !isError &&
          activities.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center py-8 text-center">
              <Activity className="h-8 w-8 text-slate-300 dark:text-slate-700" />

              <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                No recent activity
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Activity in this workspace will appear here.
              </p>
            </div>
          )}

        {/* Activities */}
        {!isLoading &&
          !isError &&
          activities.length > 0 && (
            <div className="space-y-0">
              {activities.map((activity) => {
                const config = getActivityConfig(
                  activity.action,
                );

                const Icon = config.icon;

                return (
                  <div
                    key={activity.id}
                    className="
                      flex
                      min-h-[72px]
                      items-start
                      gap-4
                      border-b
                      border-slate-100
                      py-4
                      last:border-b-0
                      dark:border-slate-800
                    "
                  >
                    {/* Icon */}
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-100
                        text-slate-600
                        dark:bg-slate-800
                        dark:text-slate-300
                      "
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {config.title}
                      </p>

                      <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                        {config.description(activity)}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        by {activity.user.fullName}
                      </p>
                    </div>

                    {/* Time */}
                    <span className="shrink-0 text-xs text-slate-400">
                      {formatRelativeTime(
                        activity.createdAt,
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}