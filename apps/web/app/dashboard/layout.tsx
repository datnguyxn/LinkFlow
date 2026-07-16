'use client';

import Sidebar from '@/components/layouts/Sidebar';
import { useInitializeUser } from '@/hooks/useInitializeUser';
import { useSidebarStore } from '@/stores/sidebar.store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const collapsed = useSidebarStore((state) => state.collapsed);
  useInitializeUser();
  console.log('Dashboard Layout');
  return (
    <div className="flex bg-slate-50">
      <Sidebar />

      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-72'}`}>
        {children}
      </main>
    </div>
  );
}
