'use client';

import Link from 'next/link';
import { Link2 } from 'lucide-react';

export default function SidebarLogo({
  collapsed,
}: {
  collapsed: boolean;
}) {
  return (
    <div className="border-b border-slate-200 p-6 dark:border-slate-800">
      <Link href="/dashboard" className="flex items-center gap-3">
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-gradient-to-r
            from-blue-600
            to-violet-600
            text-white
          "
        >
          <Link2 size={22} />
        </div>

        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold">LinkFlow</h1>

            <p className="text-xs text-slate-500">
              Smart URL Platform
            </p>
          </div>
        )}
      </Link>
    </div>
  );
}