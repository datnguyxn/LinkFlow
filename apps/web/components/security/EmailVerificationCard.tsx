'use client';

import { useAuth } from '@/hooks/useAuth';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

import Button from '@/components/ui/button';
import { MailCheck, CheckCircle2 } from 'lucide-react';
import EmailVerificationCardSkeleton from './EmailVerificationCardSkeleton';

export default function EmailVerificationCard() {
  const { loading, user } = useAuth();

  if (loading) {
    return <EmailVerificationCardSkeleton />;
  }

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
        <div className="rounded-xl border p-6 flex items-center gap-4">
          <p className="font-medium">{user?.email}</p>

          <div className="ml-auto flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            Verified
          </div>
        </div>

        <Button disabled={user?.emailVerified || loading} variant="outline">
          Verify
        </Button>
      </CardContent>
    </Card>
  );
}
