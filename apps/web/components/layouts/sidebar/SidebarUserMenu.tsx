'use client';

import Image from 'next/image';
import Link from 'next/link';

import { ChevronDown, LogOut, Settings, Bell } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';
import { UserProfile } from '@/types/auth.type';

interface SidebarUserMenuProps {
  collapsed: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  user: UserProfile | null;
  avatarUrl?: string | null;
  onLogout: () => void;
}

export default function SidebarUserMenu({
  collapsed,
  open,
  setOpen,
  user,
  avatarUrl,
  onLogout,
}: SidebarUserMenuProps) {
  const avatar = avatarUrl || '/avatars/default-avt.jpg';

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            `
              group
              flex
              w-full
              items-center
              rounded-2xl
              transition-all
              duration-200
              hover:bg-slate-100
              dark:hover:bg-slate-800
            `,
            collapsed ? 'justify-center p-2' : 'gap-3 p-2',
          )}
        >
          <Image
            src={avatar}
            alt={user?.fullName ?? 'Avatar'}
            width={44}
            height={44}
            className="
              h-11
              w-11
              shrink-0
              rounded-full
              object-cover
              ring-2
              ring-slate-200
              transition
              group-hover:ring-blue-500
              dark:ring-slate-700
            "
          />

          {!collapsed && (
            <>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate font-semibold text-slate-900 dark:text-white">
                  {user?.fullName}
                </p>

                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>

              <ChevronDown
                className={cn(
                  'h-5 w-5 shrink-0 text-slate-400 transition-transform',
                  open && 'rotate-180',
                )}
              />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align={collapsed ? 'center' : 'start'}
        sideOffset={10}
        className="
          w-70
          overflow-hidden
          rounded-2xl
          border
          bg-white
          p-2
          shadow-2xl
          dark:bg-slate-900
        "
      >
        <div
          className="
            mb-2
            flex
            items-center
            gap-3
            rounded-xl
            bg-slate-50
            p-3
            dark:bg-slate-800
          "
        >
          <Image
            src={avatar}
            alt={user?.fullName ?? 'Avatar'}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
          />

          <div className="min-w-0">
            <p className="truncate font-semibold">{user?.fullName}</p>

            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="h-11 cursor-pointer rounded-xl">
          <Link href="/dashboard/notifications" className="flex items-center">
            <Bell className="mr-3 h-4 w-4" />
            Notifications
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="h-11 cursor-pointer rounded-xl">
          <Link href="/dashboard/settings" className="flex items-center">
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onLogout}
          className="
            h-11
            cursor-pointer
            rounded-xl
            text-red-600
            focus:bg-red-50
            focus:text-red-600
            dark:focus:bg-red-950/30
          "
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
