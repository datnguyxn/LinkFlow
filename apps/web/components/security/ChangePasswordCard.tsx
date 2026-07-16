'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/button';
import { LockKeyhole } from 'lucide-react';

export default function ChangePasswordCard() {
  return (
    <Card className="-mt-12 mx-8 shadow-lg dark:bg-slate-900">
      <CardHeader>
        <div className="flex items-center gap-3">
          <LockKeyhole className="h-5 w-5 text-blue-600" />

          <div>
            <CardTitle>Password</CardTitle>

            <CardDescription>Update your password.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Input type="password" placeholder="Current password" />

        <Input type="password" placeholder="New password" />

        <Input type="password" placeholder="Confirm password" />

        <Button>Update Password</Button>
      </CardContent>
    </Card>
  );
}
