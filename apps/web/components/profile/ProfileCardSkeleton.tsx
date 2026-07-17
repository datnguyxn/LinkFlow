import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileCardSkeleton() {
  return (
    <Card className="-mt-20 mx-8 shadow-lg dark:bg-slate-900">
      <CardContent className="flex items-center justify-between p-6">
        {/* Left */}
        <div className="flex items-center gap-5">
          <div className="relative">
            {/* Avatar */}
            <Skeleton className="h-24 w-24 rounded-full" />

          </div>

          <div className="space-y-3">
            {/* Name */}
            <Skeleton className="h-7 w-52" />

            {/* Email */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-72" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>

            {/* Status badge */}
            <Skeleton className="h-9 w-44 rounded-full" />
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-4 rounded-xl border bg-muted/30 p-4 dark:bg-slate-900">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Member since</p>

            <Skeleton className="h-6 w-32" />
          </div>

          <div className="border-t pt-4 space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Member days</p>

            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}