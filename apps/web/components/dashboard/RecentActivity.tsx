import { Link2, Settings, BriefcaseBusiness } from 'lucide-react';

const activities = [
  {
    workspace: 'Workspace A',
    action: 'Created a short link',
    time: '2 minutes ago',
    icon: Link2,
  },
  {
    workspace: 'Workspace B',
    action: 'Updated workspace',
    time: '1 hour ago',
    icon: Settings,
  },
  {
    workspace: 'Workspace A',
    action: 'Created a new workspace',
    time: 'Yesterday',
    icon: BriefcaseBusiness,
  },
];

export default function RecentActivity() {
  return (
    <div
      className="
        mt-5
        rounded-2xl
        border
        bg-white
        p-6
        shadow-sm
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Recent Activity</h2>

        <p className="text-sm text-slate-500">Latest activity across your workspaces</p>
      </div>

      <div className="space-y-5">
        {activities.map((activity, index) => {
          const Icon = activity.icon;

          return (
            <div key={index} className="flex items-center gap-4">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-100
                  text-slate-600
                  dark:bg-slate-800
                  dark:text-slate-300
                "
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-medium">{activity.action}</p>

                <p className="text-sm text-slate-500">{activity.workspace}</p>
              </div>

              <span className="text-xs text-slate-400">{activity.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
