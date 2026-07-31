import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
}

export default function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return (
    <div
      className="
        rounded-2xl
        border
        bg-white
        p-6
        shadow-sm
        transition
        hover:shadow-md
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight">{value}</h2>

          {description && <p className="mt-2 text-xs text-slate-500">{description}</p>}
        </div>

        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-blue-100
            text-blue-600
            dark:bg-blue-950
            dark:text-blue-400
          "
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
