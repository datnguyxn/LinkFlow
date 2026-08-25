'use client';

import {
  Link2,
  MousePointerClick,
  QrCode,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';

const stats = [
  {
    title: 'Total Links',
    value: '154',
    icon: Link2,
    description: '+12 this month',
  },
  {
    title: 'Total Clicks',
    value: '18,492',
    icon: MousePointerClick,
    description: '+18.2% this month',
  },
  {
    title: 'QR Codes',
    value: '48',
    icon: QrCode,
    description: '8 active campaigns',
  },
  {
    title: 'CTR',
    value: '18.2%',
    icon: TrendingUp,
    description: '+2.5% this month',
  },
];

export default function LinkStatisticCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 -mt-16">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{stat.title}</p>

                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </p>
              </div>

              <div
                className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-blue-100
                text-blue-600
                dark:bg-blue-500/10
                dark:text-blue-400
              "
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-xs text-emerald-600">
              <ArrowUpRight className="h-3 w-3" />
              {stat.description}
            </div>
          </div>
        );
      })}
    </div>
  );
}