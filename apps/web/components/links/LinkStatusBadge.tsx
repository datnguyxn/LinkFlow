'use client';

import { Badge } from '@/components/ui/badge';

interface Props {
  status: string;
}

const STATUS_MAP = {
  ACTIVE: {
    label: 'Active',
    className:
      'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400',
  },

  INACTIVE: {
    label: 'Inactive',
    className:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300',
  },

  EXPIRED: {
    label: 'Expired',
    className:
      'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400',
  },

  ARCHIVED: {
    label: 'Archived',
    className:
      'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400',
  },
} as const;

export default function LinkStatusBadge({
  status,
}: Props) {
  const item =
    STATUS_MAP[
      status as keyof typeof STATUS_MAP
    ] ??
    STATUS_MAP.INACTIVE;

  return (
    <Badge
      variant="outline"
      className={item.className}
    >
      {item.label}
    </Badge>
  );
}