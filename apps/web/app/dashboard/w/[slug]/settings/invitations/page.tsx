// app/dashboard/w/[slug]/settings/members/page.tsx

'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { useWorkspaceContext } from '@/contexts/workspace.context';

import WorkspaceSettingsPageSkeleton from '@/components/workspace/settings/WorkspaceSettingsPageSkeleton';

import WorkspaceInvitationsPage from '@/components/workspace/invitations/WorkspaceInvitationsPage';

export default function WorkspaceInvitationsRoute() {
  const { currentWorkspace, loading } = useWorkspaceContext();

  if (loading || !currentWorkspace) {
    return <WorkspaceSettingsPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
        {/* Back */}
        <Link
          href={`/dashboard/w/${currentWorkspace.slug}/settings`}
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-medium
            text-slate-500
            transition
            hover:text-slate-900
            dark:text-slate-400
            dark:hover:text-white
          "
        >
          <ArrowLeft className="h-4 w-4" />
          Back to workspace settings
        </Link>

        <WorkspaceInvitationsPage workspace={currentWorkspace} />
      </main>
    </div>
  );
}
