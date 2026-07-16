import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Link, BarChart, CreditCard } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    {
      title: 'Create Link',
      icon: Link,
    },
    {
      title: 'Analytics',
      icon: BarChart,
    },
    {
      title: 'Plans',
      icon: CreditCard,
    },
  ];

  return (
    <Card className="shadow-lg dark:bg-slate-900">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>

      <CardContent
        className="
          space-y-3
          "
      >
        {actions.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              className="
                flex
                items-center
                gap-3
                w-full
                p-3
                rounded-lg
                hover:bg-muted
                "
            >
              <Icon size={18} />

              {item.title}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
