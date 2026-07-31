'use client';

import { useWorkspaceContext } from '@/contexts/workspace.context';

import WorkspaceHeader from '@/components/workspace/WorkspaceHeader';
import WorkspaceStats from '@/components/workspace/WorkspaceStats';
import RecentActivity from '@/components/workspace/RecentActivity';
import WorkspaceInformation from '@/components/workspace/WorkspaceInformation';
import WorkspaceManagement from '@/components/workspace/WorkspaceManagement';
import WorkspaceOverviewSkeleton from '@/components/workspace/WorkspaceOverviewSkeleton';

export default function WorkspaceOverviewPage() {
  const { currentWorkspace, loading } = useWorkspaceContext();

  if (loading || !currentWorkspace) {
    return <WorkspaceOverviewSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Workspace Header */}
      <WorkspaceHeader workspace={currentWorkspace} />

      <div className="space-y-8 mx-auto max-w-7xl">
        {/* Workspace Stats */}
        <WorkspaceStats workspace={currentWorkspace} />

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivity workspaceId={currentWorkspace.id} />
          </div>

          {/* Workspace Information */}
          <WorkspaceInformation workspace={currentWorkspace} />
        </div>

        {/* Management */}
        <WorkspaceManagement workspace={currentWorkspace} />
      </div>
    </div>
  );
}
