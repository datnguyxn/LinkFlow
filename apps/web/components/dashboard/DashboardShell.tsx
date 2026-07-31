'use client';

import Sidebar from '@/components/layouts/Sidebar';
import WorkspaceProvider from '@/providers/WorkspaceProvider';
import { useSidebarStore } from '@/stores/sidebar.store';

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const collapsed = useSidebarStore(
    (state) => state.collapsed,
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <WorkspaceProvider slug="default">
        <Sidebar />

        <main
          className={`
          transition-all
          duration-300
          ${collapsed ? 'ml-20' : 'ml-72'}
        `}
        >
          {children}
        </main>
      </WorkspaceProvider>
    </div>
  );
}