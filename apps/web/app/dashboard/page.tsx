import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import ClicksOverview from '@/components/dashboard/ClicksOverview';
import RecentActivity from '@/components/dashboard/RecentActivity';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardHeader />

      <section className="space-y-8 mx-auto max-w-7xl">
        <DashboardStats />

        <ClicksOverview />

        <RecentActivity />
      </section>
    </div>
  );
}
