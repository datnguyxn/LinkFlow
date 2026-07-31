'use client';

import Link from 'next/link';

import {
  BarChart3,
  Building2,
  Link as LinkIcon,
  QrCode,
} from 'lucide-react';

import { cn } from '@/lib/utils';

export default function SidebarWorkspaceNavigation({
  collapsed,
  workspaceSlug,
  isActive,
}: {
  collapsed: boolean;
  workspaceSlug?: string;
  isActive: (href: string) => boolean;
}) {
  if (!workspaceSlug) {
    return null;
  }

  const menus = [
    {
      name: 'Overview',
      href: `/dashboard/w/${workspaceSlug}`,
      icon: Building2,
    },
    {
      name: 'Links',
      href: `/dashboard/w/${workspaceSlug}/links`,
      icon: LinkIcon,
    },
    {
      name: 'QR Codes',
      href: `/dashboard/w/${workspaceSlug}/qrcodes`,
      icon: QrCode,
    },
    {
      name: 'Analytics',
      href: `/dashboard/w/${workspaceSlug}/analytics`,
      icon: BarChart3,
    },
  ];

  return (
    <>
      {!collapsed && (
        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </div>
      )}

      <div className="space-y-2">
        {menus.map((menu) => {
          const Icon = menu.icon;

          const active = isActive(menu.href);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={cn(
                'flex items-center rounded-xl px-4 py-3 transition-all',
                active
                  ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow'
                  : `
                    text-slate-600
                    hover:bg-slate-100
                    dark:text-slate-300
                    dark:hover:bg-slate-800
                  `,
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />

              {!collapsed && (
                <span className="ml-3 font-medium">
                  {menu.name}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}