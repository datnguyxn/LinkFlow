'use client';

import { useState } from 'react';

import { useLanguage } from '@/hooks/useLanguage';
import { useLogout } from '@/hooks/mutations/auth/useLogout';

import { appToast } from '@/lib/toast';

import SidebarLanguageTheme from './SidebarLanguageTheme';
import SidebarUserMenu from './SidebarUserMenu';
import { UserProfile } from '@/types/auth.type';

export default function SidebarFooter({
  collapsed,
  user,
  avatarUrl,
}: {
  collapsed: boolean;
  user: UserProfile | null;
  avatarUrl?: string | null;
}) {
  const [open, setOpen] = useState(false);

  const { language, changeLanguage } = useLanguage();

  const logout = useLogout();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();

      appToast.success('Logged out successfully');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="border-t border-slate-200 p-3 dark:border-slate-800">
      <SidebarLanguageTheme
        collapsed={collapsed}
        language={language}
        changeLanguage={changeLanguage}
      />

      <SidebarUserMenu
        collapsed={collapsed}
        open={open}
        setOpen={setOpen}
        user={user}
        avatarUrl={avatarUrl}
        onLogout={handleLogout}
      />
    </div>
  );
}
