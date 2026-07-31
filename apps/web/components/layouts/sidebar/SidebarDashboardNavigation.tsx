'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';

import { cn } from '@/lib/utils';

export default function SidebarDashboardNavigation({
  collapsed,
  isActive,
  currentPath,
}: {
  collapsed: boolean;
  isActive: (href: string) => boolean;
  currentPath: string;
}) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        'mb-6 flex items-center rounded-xl px-4 py-3 transition-all',
        isActive('/dashboard') &&
          !currentPath.startsWith('/dashboard/')
          ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow'
          : `
            text-slate-600
            hover:bg-slate-100
            dark:text-slate-300
            dark:hover:bg-slate-800
          `,
      )}
    >
      <Home className="h-5 w-5 shrink-0" />

      {!collapsed && (
        <span className="ml-3 font-medium">
          Dashboard
        </span>
      )}
    </Link>
  );
}