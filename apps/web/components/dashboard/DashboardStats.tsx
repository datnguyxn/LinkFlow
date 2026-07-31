'use client';

import { BriefcaseBusiness, Link2, MousePointerClick, Activity } from 'lucide-react';

import StatCard from './StatCard';

export default function DashboardStats() {
  return (
    <div className="-mt-20 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Workspaces"
        value="3"
        description="Across your account"
        icon={BriefcaseBusiness}
      />

      <StatCard title="Total Links" value="248" description="All shortened links" icon={Link2} />

      <StatCard
        title="Total Clicks"
        value="12,450"
        description="Across all workspaces"
        icon={MousePointerClick}
      />

      <StatCard title="Active Links" value="182" description="Currently active" icon={Activity} />
    </div>
  );
}
