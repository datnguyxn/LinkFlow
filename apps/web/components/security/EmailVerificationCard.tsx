import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

import Button from '@/components/ui/button';
import { MailCheck, CheckCircle2 } from 'lucide-react';

export default function EmailVerificationCard() {
  return (
    <Card className="-mt-12 mx-8 shadow-lg dark:bg-slate-900">
      <CardHeader>
        <div className="flex items-center gap-3">
          <MailCheck className="h-5 w-5 text-emerald-600" />

          <div>
            <CardTitle>Email Verification</CardTitle>

            <CardDescription>Verify your email address.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="font-medium">dat@email.com</p>

          <div className="mt-2 flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            Verified
          </div>
        </div>

        <Button disabled>Verified</Button>
      </CardContent>
    </Card>
  );
}
