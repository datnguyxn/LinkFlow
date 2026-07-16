'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import {
  Home,
  Link2,
  BarChart3,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon,
  LogOut,
  ChevronDown,
  QrCode,
  Languages,
  Moon,
  Monitor,
  Sun,
  Check,
  Globe,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { appToast } from '@/lib/toast';
import dynamic from 'next/dynamic';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useLanguage } from '@/hooks/useLanguage';

const ThemeToggle = dynamic(() => import('@/components/common/ThemeToggle'), {
  ssr: false,
});

export default function Sidebar() {
  const pathname = usePathname();

  //const { collapsed, toggle } = useSidebarStore();

  const collapsed = useSidebarStore((state) => state.collapsed);
  const toggle = useSidebarStore((state) => state.toggle);

  const [open, setOpen] = useState(false);

  const { user, logout } = useAuth();

  const { language, changeLanguage } = useLanguage();

  const handleLogout = () => {
    try {
      logout();

      appToast.success('Logged out successfully');
    } catch (error) {
      console.error(error);
    }
  };

  function normalize(path: string) {
    if (path.length > 1 && path.endsWith('/')) {
      return path.slice(0, -1);
    }

    return path;
  }

  const currentPath = normalize(pathname);

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
      name: 'QR Codes',
      href: '/dashboard/qrcodes',
      icon: QrCode,
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
      name: 'Security',
      href: '/dashboard/security',
      icon: Monitor,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  return (
    <aside
      className={`
        fixed left-0 top-0
        
        flex
        h-screen
        flex-col
        border-r
        border-slate-200
        bg-white
        transition-all
        duration-300
        dark:border-slate-800
        dark:bg-slate-900
        ${collapsed ? 'w-20' : 'w-72'}
      `}
    >
      {/* Collapse */}
      <button
        onClick={toggle}
        className="
          absolute
          -right-4
          top-8
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-full
          border
          border-slate-200
          bg-white
          shadow-md
          transition
          hover:bg-slate-100
          dark:border-slate-700
          dark:bg-slate-800
          dark:hover:bg-slate-700
          cursor-pointer
        "
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Logo */}
      <div className="border-b border-slate-200 p-6 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-11
              w-11
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

              <p className="text-xs text-slate-500">Smart URL Platform</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-2 p-4">
        <div className="space-y-2">
          {menus.map((menu) => {
            const Icon = menu.icon;

            const active =
              menu.href === '/dashboard'
                ? currentPath === '/dashboard'
                : currentPath.startsWith(menu.href);
            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`
                flex
                items-center
                rounded-xl
                px-4
                py-3
                transition-all
                ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow'
                    : `
                      text-slate-600
                      hover:bg-slate-100
                      dark:text-slate-300
                      dark:hover:bg-slate-800
                    `
                }
              `}
              >
                <Icon className="h-5 w-5 shrink-0" />

                {!collapsed && <span className="ml-3 font-medium">{menu.name}</span>}
              </Link>
            );
          })}
        </div>

        {!collapsed ? (
          <>
            {/* Bottom */}
            <div className="border-t">
              <div className="flex items-center gap-3 mt-5 justify-center">
                {/* Language */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="
                        flex
                        h-10
                        items-center
                        gap-3
                        rounded-xl
                        border
                        px-4
                        hover:bg-slate-100
                        dark:hover:bg-slate-800
                        cursor-pointer
                      "
                    >
                      <Globe className="h-5 w-5" />

                      <span>{language === 'vi' ? '🇻🇳 VI' : '🇺🇸 EN'}</span>

                      <ChevronDown className="ml-auto h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="dark:bg-slate-900">
                    <DropdownMenuItem
                      className="hover:dark:bg-slate-800 cursor-pointer"
                      onClick={() => changeLanguage('en')}
                    >
                      🇺🇸 English
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="hover:dark:bg-slate-800 cursor-pointer"
                      onClick={() => changeLanguage('vi')}
                    >
                      🇻🇳 Tiếng Việt
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Theme */}
                <ThemeToggle />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Language */}
            <div className="border-t">
              <div className="mt-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        border
                        hover:bg-slate-100
                        dark:hover:bg-slate-800
                        mb-2
                        cursor-pointer
                      "
                    >
                      <Globe className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent side="right" className="dark:bg-slate-900">
                    <DropdownMenuItem
                      onClick={() => changeLanguage('en')}
                      className="cursor-pointer dark:bg-slate-900 hover:dark:bg-slate-800"
                    >
                      🇺🇸 English
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => changeLanguage('vi')}
                      className="cursor-pointer dark:bg-slate-900 hover:dark:bg-slate-800"
                    >
                      🇻🇳 Tiếng Việt
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Theme */}
                <ThemeToggle />
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="
            group
            flex
            w-full
            items-center
            gap-3
            rounded-2xl
            p-3
            transition-all
            duration-200
            hover:bg-slate-100
            dark:hover:bg-slate-800
            cursor-pointer
          "
          >
            <img
              src={user?.avatarUrl}
              alt={user?.fullName}
              className="
              h-11
              w-11
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
                    'h-5 w-5 text-slate-400 transition-transform duration-200',
                    open && 'rotate-180',
                  )}
                />
              </>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="top"
          align="start"
          sideOffset={10}
          className="
          w-70
          overflow-hidden
          rounded-2xl
          border
          bg-white
          p-2
          ml-1
          ms-1
          shadow-2xl
          dark:bg-slate-900
          data-[state=open]:animate-in
          data-[state=closed]:animate-out
          data-[side=top]:slide-in-from-bottom-2
        "
        >
          {/* Header */}
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
            <img
              src={user?.avatarUrl}
              alt={user?.fullName}
              className="h-12 w-12 rounded-full object-cover"
            />

            <div className="min-w-0">
              <p className="truncate font-semibold">{user?.fullName}</p>

              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            asChild
            className="
            h-11
            cursor-pointer
            rounded-xl
            hover:dark:bg-slate-800
          "
          >
            <Link href="/dashboard/profile" className="flex items-center">
              <User className="mr-3 h-4 w-4" />
              View Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="
            h-11
            cursor-pointer
            rounded-xl
            hover:dark:bg-slate-800
          "
          >
            <Link href="/dashboard/settings" className="flex items-center">
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
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
    </aside>
  );
}
