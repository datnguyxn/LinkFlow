'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Button from '@/components/ui/button';

import { Laptop } from 'lucide-react';

import ActiveSessionsDrawer from './ActiveSessionsDrawer';
import ActiveSessionsCardSkeleton from './ActiveSessionsCardSkeleton';

import { useState } from 'react';

import { useActiveSessions } from '@/hooks/queries/useActiveSessions';
import { useSignOutSession } from '@/hooks/mutations/useSignOutSession';
import { useSignOutAllOtherSessions } from '@/hooks/mutations/useSignOutAllOtherSessions';

export default function ActiveSessionsCard() {
  const [open, setOpen] = useState(false);

  const { data: sessions = [], isLoading } = useActiveSessions();

  const signOutSession = useSignOutSession();
  const signOutAllOtherSessions = useSignOutAllOtherSessions();

  if (isLoading) {
    return <ActiveSessionsCardSkeleton />;
  }

  const currentSession = sessions.find((session: { isCurrent: boolean }) => session.isCurrent);

  return (
    <>
      <Card className="mx-8 shadow-lg dark:bg-slate-900">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Laptop className="h-5 w-5 text-blue-600" />

            <div>
              <CardTitle>Active Sessions</CardTitle>

              <CardDescription>Devices currently signed into your account.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {currentSession && (
            <div className="rounded-xl border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">
                    {currentSession.browser} • {currentSession.os}
                  </h3>

                  <p className="text-sm text-muted-foreground">{currentSession.device}</p>

                  <p className="mt-1 text-xs text-muted-foreground">{currentSession.ipAddress}</p>

                  <p className="text-xs text-muted-foreground">
                    {new Date(currentSession.createdAt).toLocaleString()}
                  </p>
                </div>

                <span
                  className="
                    rounded-full
                    bg-emerald-100
                    px-3
                    py-1
                    text-xs
                    font-medium
                    text-emerald-700
                    dark:bg-emerald-500/10
                    dark:text-emerald-400
                  "
                >
                  Current
                </span>
              </div>
            </div>
          )}

          <Button variant="ghost" onClick={() => setOpen(true)}>
            View all sessions ({sessions.length})
          </Button>

          <Button
            variant="outline"
            loading={signOutAllOtherSessions.isPending}
            onClick={() => signOutAllOtherSessions.mutate()}
          >
            Sign Out All Other Devices
          </Button>
        </CardContent>
      </Card>

      <ActiveSessionsDrawer
        open={open}
        onOpenChange={setOpen}
        sessions={sessions}
        onSignOut={(id) => signOutSession.mutate(id)}
        onSignOutOthers={() => signOutAllOtherSessions.mutate()}
      />
    </>
  );
}
