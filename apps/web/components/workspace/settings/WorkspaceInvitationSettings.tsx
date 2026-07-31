import Link from 'next/link';
import { ArrowUpRight, Mail } from 'lucide-react';

import { WorkspaceDetail } from '@/types/workspace.type';

import Button from '@/components/ui/button';

export default function WorkspaceInvitationSettings({ workspace }: { workspace: WorkspaceDetail }) {
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-blue-100
              text-blue-600
              dark:bg-blue-500/10
              dark:text-blue-400
            "
          >
            <Mail className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold">Invitations</h2>

            <p className="text-sm text-slate-500">Manage workspace invitations.</p>
          </div>
        </div>

        <Link href={`/dashboard/w/${workspace.slug}/settings/invitations`}>
          <Button variant="outline" size="sm">
            Manage
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
