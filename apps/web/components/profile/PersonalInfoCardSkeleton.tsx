import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Button from '../ui/button';

export default function PersonalInfoCardSkeleton() {
  return (
    <Card className="mx-8 shadow-lg dark:bg-slate-900">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          Personal Information
        </CardTitle>

        {/* <Skeleton className="h-9 w-20 rounded-md" /> */}
        <Button variant="outline" className="h-10 w-20 rounded-2xl">
                    Edit
                  </Button>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Full Name */}
        <div className="space-y-2">
          <p className="mb-2 text-sm font-semibold">Full Name</p>

          <Skeleton className="h-5 w-64" />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <p className="mb-2 text-sm font-semibold">Email</p>

          <Skeleton className="h-5 w-72" />
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <p className="mb-2 text-sm font-semibold">Timezone</p>

          <Skeleton className="h-5 w-48" />
        </div>
      </CardContent>
    </Card>
  );
}