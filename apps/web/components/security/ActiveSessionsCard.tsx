'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

import Button from '@/components/ui/button';
import { Laptop } from 'lucide-react';
import ActiveSessionsCardSkeleton from './ActiveSessionsCardSkeleton';
import { useAuth } from '@/hooks/useAuth';

export default function ActiveSessionsCard() {

    const { loading } = useAuth();

  if (loading) {
    return <ActiveSessionsCardSkeleton />;
  } 

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
        <div className="rounded-xl border p-4">
          <p className="font-medium">Chrome • macOS</p>

          <p className="text-sm text-muted-foreground">Current device</p>
        </div>

        <Button variant="outline">Sign Out All Devices</Button>
      </CardContent>
    </Card>
  );
}
