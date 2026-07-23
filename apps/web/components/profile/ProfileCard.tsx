'use client';

import { Card, CardContent } from '@/components/ui/card';

import ProfileAvatar from './ProfileAvatar';

import { CircleCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProfileCardSkeleton from './ProfileCardSkeleton';
import { useAuthContext } from '@/contexts/auth.context';

export default function ProfileCard() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <ProfileCardSkeleton />;
  }

  const memberSince = user?.createdAt
    ? new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
      }).format(new Date(user.createdAt))
    : 'N/A';

  const statusConfig = () => {
    switch (user?.status) {
      case 'ACTIVE':
        return {
          label: 'Active Account',
          className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
          dot: 'bg-emerald-500',
        };

      case 'INACTIVE':
        return {
          label: 'Inactive Account',
          className: 'bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300',
          dot: 'bg-gray-500',
        };

      case 'SUSPENDED':
        return {
          label: 'Suspended Account',
          className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400',
          dot: 'bg-yellow-500',
        };

      case 'DELETED':
        return {
          label: 'Deleted Account',
          className: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
          dot: 'bg-red-500',
        };

      default:
        return {
          label: 'Unknown Status',
          className: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
          dot: 'bg-slate-500',
        };
    }
  };

  const status = statusConfig();

  return (
    <Card className="-mt-20 mx-8 shadow-lg dark:bg-slate-900">
      <CardContent
        className="
            flex
            items-center
            justify-between
            p-6
            "
      >
        <div
          className="
            flex
            items-center
            gap-5
            "
        >
          <ProfileAvatar />

          <div>
            <h2 className="text-xl font-semibold">{user?.fullName}</h2>

            <div className="mt-1 flex items-center gap-2">
              <p className="text-muted-foreground">{user?.email}</p>

              {user?.emailVerified && (
                <CircleCheck className="h-4 w-4 fill-emerald-500 text-white" />
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <div
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium',
                  status.className,
                )}
              >
                <span className={cn('h-2.5 w-2.5 rounded-full', status.dot)} />

                {status.label}
              </div>
            </div>

            {/* Nếu sau này có plan */}
            {/* <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              Free Plan
            </div> */}
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border bg-muted/30 p-4 dark:bg-slate-900">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Member since</p>

            <p className="mt-1 text-base font-semibold">{memberSince}</p>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Member days</p>

            <p className="mt-1 text-base font-semibold">
              {user?.createdAt
                ? Math.floor(new Date().getDay() - new Date(user.createdAt).getDay())
                : 'N/A'}{' '}
              days
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
