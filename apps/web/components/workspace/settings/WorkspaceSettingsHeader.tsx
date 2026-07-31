'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Settings,
} from 'lucide-react';

import { WorkspaceDetail } from '@/types/workspace.type';

import WorkspaceAvatar from '@/components/layouts/sidebar/WorkspaceAvatar';

export default function WorkspaceSettingsHeader({
  workspace,
}: {
  workspace: WorkspaceDetail;
}) {
  return (
    <div
      className="
        border-b
        border-slate-200
        bg-white
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      <div className="mx-auto max-w-5xl p-6 lg:p-8">
        <Link
          href={`/dashboard/w/${workspace.slug}`}
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            text-sm
            text-slate-500
            transition
            hover:text-slate-900
            dark:hover:text-white
          "
        >
          <ArrowLeft className="h-4 w-4" />

          Back to workspace
        </Link>

        <div className="flex items-center gap-4">
          <WorkspaceAvatar
            workspace={workspace}
            size="large"
          />

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                Workspace settings
              </h1>

              <Settings className="h-5 w-5 text-slate-400" />
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Manage settings for {workspace.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}