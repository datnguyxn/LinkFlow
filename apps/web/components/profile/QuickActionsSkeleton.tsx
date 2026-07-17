import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function QuickActionsSkeleton() {
  return (
    <Card className="mx-8 shadow-lg dark:bg-slate-900">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-lg p-3">
            <Skeleton className="h-5 w-5 rounded" />

            <Skeleton className="h-5 w-32" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
