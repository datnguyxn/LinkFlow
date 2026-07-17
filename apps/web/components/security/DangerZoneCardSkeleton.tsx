import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2 } from 'lucide-react';

export default function DangerZoneCardSkeleton() {
  return (
    <Card className="mx-8 border-red-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Trash2 className="h-5 w-5 text-red-600" />

          <div>
            <CardTitle className="text-red-600">
              Danger Zone
            </CardTitle>

            <CardDescription>
              Permanently delete your account.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />

          <Skeleton className="h-4 w-52" />
        </div>

        <Skeleton className="h-10 w-36 rounded-md" />
      </CardContent>
    </Card>
  );
}