import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MailCheck, CheckCircle2 } from 'lucide-react';

export default function EmailVerificationCardSkeleton() {
  return (
    <Card className="mx-8 shadow-lg dark:bg-slate-900">
      <CardHeader>
        <div className="flex items-center gap-3">
          <MailCheck className="h-5 w-5 text-emerald-600" />

          <div>
            <CardTitle>Email Verification</CardTitle>

            <CardDescription>Verify your email address.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 rounded-xl border p-6">
          {/* Email */}
          <Skeleton className="h-5 w-64" />

          {/* Status */}
          <div className="ml-auto flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-slate-300 dark:text-slate-600" />

            <Skeleton className="h-5 w-16" />
          </div>
        </div>

        <Skeleton className="h-10 w-28 rounded-md" />
      </CardContent>
    </Card>
  );
}
