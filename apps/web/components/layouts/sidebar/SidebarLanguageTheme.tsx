'use client';

import dynamic from 'next/dynamic';
import { Globe, ChevronDown, Bell } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';

const ThemeToggle = dynamic(() => import('@/components/common/ThemeToggle'), {
  ssr: false,
});

export default function SidebarLanguageTheme({
  collapsed,
  language,
  changeLanguage,
}: {
  collapsed: boolean;
  language: string;
  changeLanguage: (language: 'en' | 'vi') => void;
}) {
  return (
    <div
      className={cn(
        'mb-3 flex items-center',
        collapsed ? 'flex-col gap-2' : 'justify-center gap-3',
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              `
                flex
                h-10
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                transition
                hover:bg-slate-100
                dark:border-slate-700
                dark:hover:bg-slate-800
              `,
              collapsed ? 'w-10' : 'gap-2 px-3',
            )}
          >
            <Globe className="h-5 w-5 shrink-0" />

            {!collapsed && (
              <>
                <span className="text-sm font-medium">{language === 'vi' ? '🇻🇳 VI' : '🇺🇸 EN'}</span>

                <ChevronDown className="h-4 w-4 text-slate-400" />
              </>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side={collapsed ? 'right' : 'top'}
          align={collapsed ? 'end' : 'center'}
          sideOffset={8}
          className="dark:bg-slate-900"
        >
          <DropdownMenuItem onClick={() => changeLanguage('en')} className="cursor-pointer">
            🇺🇸 English
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => changeLanguage('vi')} className="cursor-pointer">
            🇻🇳 Tiếng Việt
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border
          border-slate-200
          dark:border-slate-700
        "
      >
        <ThemeToggle />
      </div>

      <div
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border
          border-slate-200
          dark:border-slate-700
          cursor-pointer
        "
      >
        <Bell className="h-5 w-5" />
      </div>
    </div>
  );
}
