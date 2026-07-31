'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

import { useSidebarStore } from '@/stores/sidebar.store';
import { useAuthContext } from '@/contexts/auth.context';
import { useWorkspaceContext } from '@/contexts/workspace.context';

import CreateWorkspaceDialog from '@/components/workspace/create/CreateWorkspaceDialog';

import SidebarCollapseButton from './sidebar/SidebarCollapseButton';
import SidebarLogo from './sidebar/SidebarLogo';
import SidebarDashboardNavigation from './sidebar/SidebarDashboardNavigation';
import SidebarWorkspaceSwitcher from './sidebar/SidebarWorkspaceSwitcher';
import SidebarWorkspaceNavigation from './sidebar/SidebarWorkspaceNavigation';
import SidebarSettings from './sidebar/SidebarSettings';
import SidebarFooter from './sidebar/SidebarFooter';

export default function Sidebar() {
  const pathname = usePathname();

  const collapsed = useSidebarStore(
    (state) => state.collapsed,
  );

  const { user, authenticated } = useAuthContext();


  const {
    workspaces,
    currentWorkspace,
    loading: workspaceLoading,
  } = useWorkspaceContext();

  const [
    openCreateWorkspaceDialog,
    setOpenCreateWorkspaceDialog,
  ] = useState(false);

  const normalize = (path: string) => {
    if (
      path.length > 1 &&
      path.endsWith('/')
    ) {
      return path.slice(0, -1);
    }

    return path;
  };

  const currentPath = normalize(pathname);

  const isActive = (href: string) => {
    return (
      currentPath === href ||
      currentPath.startsWith(`${href}/`)
    );
  };

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col',
          'border-r border-slate-200 bg-white',
          'transition-all duration-300',
          'dark:border-slate-800 dark:bg-slate-900',
          collapsed ? 'w-20' : 'w-72',
        )}
      >
        <SidebarCollapseButton />

        <SidebarLogo collapsed={collapsed} />

        <nav className="flex-1 overflow-y-auto p-4">
          <SidebarDashboardNavigation
            collapsed={collapsed}
            isActive={isActive}
            currentPath={currentPath}
          />

          <SidebarWorkspaceSwitcher
            collapsed={collapsed}
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            loading={workspaceLoading}
            onCreateWorkspace={() =>
              setOpenCreateWorkspaceDialog(true)
            }
          />

          <SidebarWorkspaceNavigation
            collapsed={collapsed}
            workspaceSlug={currentWorkspace?.slug}
            isActive={isActive}
          />

          <SidebarSettings
            collapsed={collapsed}
            isActive={isActive}
          />
        </nav>

        <SidebarFooter
          collapsed={collapsed}
          user={user}
          avatarUrl={user?.avatarUrl}
        />
      </aside>

      <CreateWorkspaceDialog
        open={openCreateWorkspaceDialog}
        onOpenChange={setOpenCreateWorkspaceDialog}
      />
    </>
  );
}