import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LockKeyhole } from 'lucide-react';

export default function ChangePasswordCardSkeleton() {
  return (
    <Card className="mx-8 shadow-lg dark:bg-slate-900">
      <CardHeader>
        <div className="flex items-center gap-3">
          <LockKeyhole className="h-5 w-5 text-blue-600" />

          <div>
            <CardTitle>Password</CardTitle>

            <CardDescription>Update your password.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {[1, 2, 3].map((item) => (
          <div key={item} className="space-y-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {item === 1
                ? 'Current Password'
                : item === 2
                  ? 'New Password'
                  : 'Confirm New Password'}
            </p>

            <Skeleton className="h-11 w-full rounded-md" />
          </div>
        ))}

        <Skeleton className="h-10 w-40 rounded-md" />
      </CardContent>
    </Card>
  );
}
