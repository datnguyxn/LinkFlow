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
import { useLogout } from '@/hooks/mutations/useLogout';
import { tokenStorage } from '@/lib/storage/token.storage';
import { queryClient } from '@/lib/query-client';
import ConfirmDialog from '../common/ConfirmDialog';
import { useAuthContext } from '@/contexts/auth.context';
import { appToast } from '@/lib/toast';

export default function ActiveSessionsCard() {
  const [open, setOpen] = useState(false);

  const { loading, authenticated } = useAuthContext();

  const { data: sessions = [], isLoading: sessionsLoading } = useActiveSessions(authenticated);
  const logout = useLogout();

  const signOutSession = useSignOutSession();
  const signOutAllOtherSessions = useSignOutAllOtherSessions();

  const handleSignOutSession = async (sessionId: string, current: boolean) => {
    try {
      await signOutSession.mutateAsync(sessionId);

      // Nếu vừa sign out chính session hiện tại thì logout luôn
      if (current) {
        await logout.mutateAsync();

        appToast.success('Logged out of current session successfully');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignOutAllOtherSessions = async () => {
    try {
      await signOutAllOtherSessions.mutateAsync();

      // Backend đã revoke toàn bộ session khác,
      // session hiện tại cũng nên logout theo yêu cầu của bạn
      await logout.mutateAsync();

      queryClient.clear();

      tokenStorage.clear();

      appToast.success('Logged out of all other sessions successfully');
    } catch (error) {
      console.error(error);
    }
  };

  const currentSession = sessions.find((session: { current: boolean }) => session.current);

  console.log('sessions', sessions);
  console.log('currentSession', currentSession);
  if (loading || sessionsLoading) {
    return <ActiveSessionsCardSkeleton />;
  }

  return (
    <>
      <Card className="mx-8 shadow-lg dark:bg-slate-900">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Laptop className="h-5 w-5 text-blue-600" />

            <div>
              <CardTitle>Active Sessions</CardTitle>

              <CardDescription>Devices currently signed into your account</CardDescription>
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

          {sessions.length > 1 && (
            <Button variant="ghost" onClick={() => setOpen(true)}>
              View all sessions ({sessions.length})
            </Button>
          )}

          <ConfirmDialog
            title="Sign out of all other sessions?"
            description="This will sign you out of all other devices except the current one."
            confirmText="Sign Out Others"
            loading={signOutAllOtherSessions.isPending}
            variant="destructive"
            onConfirm={handleSignOutAllOtherSessions}
            trigger={
              <Button
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-100 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600"
              >
                Sign Out All Other Sessions
              </Button>
            }
          />
        </CardContent>
      </Card>

      <ActiveSessionsDrawer
        open={open}
        onOpenChange={setOpen}
        sessions={sessions}
        onSignOut={(id) => handleSignOutSession(id, id === currentSession?.id)}
        onSignOutOthers={() => handleSignOutAllOtherSessions()}
      />
    </>
  );
}
