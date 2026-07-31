'use client';

import { ChevronRight } from 'lucide-react';

import { WorkspaceInvitation } from '@/types/workspace.type';

interface Props {
  invitation: WorkspaceInvitation;
  onClick: () => void;
}

export default function WorkspaceInvitationRow({ invitation, onClick }: Props) {
  return (
    <tr
      onClick={onClick}
      className="
        cursor-pointer
        border-b
        transition
        hover:bg-slate-50
        dark:hover:bg-slate-800
      "
    >
      <td className="px-5 py-4">
        <div>
          <p className="font-medium">{invitation.email}</p>

          <p className="text-xs text-slate-500">Invited by {invitation.inviter.fullName}</p>
        </div>
      </td>

      <td className="px-5">{invitation.role.name}</td>

      <td className="px-5">
        <InvitationStatusBadge status={invitation.status} />
      </td>

      <td className="px-5">{new Date(invitation.expiresAt).toLocaleDateString()}</td>

      <td className="w-10 pr-5">
        <ChevronRight className="h-4 w-4 text-slate-400" />
      </td>
    </tr>
  );
}

function InvitationStatusBadge({ status }: { status: string }) {
  const color = {
    PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',

    ACCEPTED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',

    EXPIRED: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',

    REVOKED: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',

    DECLINED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
  }[status];

  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${color}`}>{status}</span>;
}
