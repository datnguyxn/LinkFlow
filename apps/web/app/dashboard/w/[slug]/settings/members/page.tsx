// app/dashboard/w/[slug]/settings/members/page.tsx

'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { useWorkspaceContext } from '@/contexts/workspace.context';

import WorkspaceSettingsPageSkeleton from '@/components/workspace/settings/WorkspaceSettingsPageSkeleton';
import WorkspaceMembersPage from '@/components/workspace/members/WorkspaceMembersPage';

import { WORKSPACE_PERMISSION } from '@/constants/permissions';

export default function WorkspaceMembersRoute() {
  const { currentWorkspace, loading } = useWorkspaceContext();

  if (loading || !currentWorkspace) {
    return <WorkspaceSettingsPageSkeleton />;
  }

  const canManageWorkspace =
    currentWorkspace.permissions?.includes(
      WORKSPACE_PERMISSION.WORKSPACE_UPDATE,
    ) ?? false;

  const backHref = canManageWorkspace
    ? `/dashboard/w/${currentWorkspace.slug}/settings`
    : `/dashboard/w/${currentWorkspace.slug}`;

  const backLabel = canManageWorkspace
    ? 'Back to workspace settings'
    : 'Back to workspace';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
        <Link
          href={backHref}
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-medium
            text-slate-500
            transition-colors
            hover:text-slate-900
            dark:text-slate-400
            dark:hover:text-white
          "
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>

        <WorkspaceMembersPage workspace={currentWorkspace} />
      </main>
    </div>
  );
}