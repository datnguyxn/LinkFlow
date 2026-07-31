import Link from 'next/link';

import { KeyRound, ShieldCheck, ArrowUpRight } from 'lucide-react';

import { WorkspaceDetail } from '@/types/workspace.type';

import Button from '@/components/ui/button';

export default function WorkspaceSecuritySettings({ workspace }: { workspace: WorkspaceDetail }) {
  return (
    <section
      className="
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
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Security & access</h2>

        <p className="mt-1 text-sm text-slate-500">Manage access and security settings.</p>
      </div>

      <div className="space-y-3">
        {/* API Keys */}
        <div
          className="
            flex
            items-center
            justify-between
            rounded-xl
            border
            border-slate-200
            p-4
            dark:border-slate-800
          "
        >
          <div className="flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-slate-500" />

            <div>
              <p className="font-medium">API keys</p>

              <p className="text-sm text-slate-500">Manage API access for this workspace.</p>
            </div>
          </div>

          <Link href={`/dashboard/w/${workspace.slug}/api-keys`}>
            <Button variant="outline" size="sm">
              Manage
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* RBAC */}
        <div
          className="
            flex
            items-center
            justify-between
            rounded-xl
            border
            border-slate-200
            p-4
            dark:border-slate-800
          "
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-slate-500" />

            <div>
              <p className="font-medium">Roles & permissions</p>

              <p className="text-sm text-slate-500">Control what workspace members can access.</p>
            </div>
          </div>

          <Link href={`/dashboard/w/${workspace.slug}/roles`}>
            <Button variant="outline" size="sm">
              Manage
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
