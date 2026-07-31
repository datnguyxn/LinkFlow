'use client';

import { LucideIcon } from 'lucide-react';

interface WorkspaceInvitationSummaryProps {
  icon: LucideIcon;
  label: string;
  value: number;
  iconClassName: string;
}

export default function WorkspaceInvitationSummary({
  icon: Icon,
  label,
  value,
  iconClassName,
}: WorkspaceInvitationSummaryProps) {
  return (
    <div className="flex flex-1 items-center gap-4 px-6 py-5">
      <div
        className={`
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          bg-slate-100
          dark:bg-slate-800
          ${iconClassName}
        `}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>

        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
