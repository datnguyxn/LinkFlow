'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';

import { cn } from '@/lib/utils';

export default function SidebarSettings({
  collapsed,
  isActive,
}: {
  collapsed: boolean;
  isActive: (href: string) => boolean;
}) {
  return (
    <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
      <Link
        href="/dashboard/settings"
        className={cn(
          'flex items-center rounded-xl px-4 py-3 transition-all',
          isActive('/dashboard/settings')
            ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow'
            : `
              text-slate-600
              hover:bg-slate-100
              dark:text-slate-300
              dark:hover:bg-slate-800
            `,
        )}
      >
        <Settings className="h-5 w-5 shrink-0" />

        {!collapsed && (
          <span className="ml-3 font-medium">
            Settings
          </span>
        )}
      </Link>
    </div>
  );
}