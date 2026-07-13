'use client';

import Link from 'next/link';
import { Home, Link as LinkIcon, BarChart3, User, Settings } from 'lucide-react';

export default function Sidebar() {
  const menus = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Links',
      href: '/dashboard/links',
      icon: LinkIcon,
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: User,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  return (
    <aside
      className="
      fixed
      left-0
      top-0
      h-screen
      w-64
      bg-white
      border-r
      p-6
      "
    >
      <h1
        className="
        text-2xl
        font-bold
        mb-10
      "
      >
        LinkFlow
      </h1>

      <nav className="space-y-2">
        {menus.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="
              flex
              items-center
              gap-3
              px-3
              py-2
              rounded-lg
              text-slate-600
              hover:bg-slate-100
              hover:text-slate-900
              transition
              "
            >
              <Icon size={18} />

              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
