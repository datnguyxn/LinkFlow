'use client';

import { useAuthContext } from '@/contexts/auth.context';

export default function DashboardHeader() {
  const { user } = useAuthContext();

  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  const hour = new Date().getHours();

  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div
      className="h-56
        bg-gradient-to-r
        from-slate-600
        via-blue-600
        to-green-500
        p-10
        text-white"
    >
      <h1 className="text-3xl font-bold tracking-tight">
        {greeting}, {firstName} 👋
      </h1>

      <p className="mt-2 text-slate-500 dark:text-slate-400">
        Here is what is happening across your account.
      </p>
    </div>
  );
}
