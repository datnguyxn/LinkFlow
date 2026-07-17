import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Laptop } from 'lucide-react';

export default function ActiveSessionsCardSkeleton() {
  return (
    <Card className="mx-8 shadow-lg dark:bg-slate-900">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Laptop className="h-5 w-5 text-blue-600" />

          <div>
            <CardTitle>Active Sessions</CardTitle>

            <CardDescription>Devices signed in.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Device */}
        <div className="rounded-xl border p-4 space-y-2">
          <Skeleton className="h-5 w-40" />

          <Skeleton className="h-4 w-28" />
        </div>

        {/* Button */}
        <Skeleton className="h-10 w-48 rounded-md" />
      </CardContent>
    </Card>
  );
}