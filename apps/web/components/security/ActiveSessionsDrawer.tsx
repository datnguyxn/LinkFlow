'use client';

import { Badge } from '@/components/ui/badge';
import Button from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

import ConfirmDialog from '../common/ConfirmDialog';

export interface Session {
  id: string;
  current: boolean;
  browser: string;
  os: string;
  device: string;
  ipAddress: string;
  createdAt: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: Session[];

  onSignOut: (id: string) => void;
  onSignOutOthers: () => void;
  signingOutOthers?: boolean;
}

export default function ActiveSessionsDrawer({
  open,
  onOpenChange,
  sessions,
  onSignOut,
  onSignOutOthers,
  signingOutOthers = false,
}: Props) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="ml-auto h-full max-w-xl rounded-l-2xl rounded-r-none">
        <DrawerHeader>
          <DrawerTitle>Active Sessions</DrawerTitle>

          <DrawerDescription>Devices currently signed in to your account.</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-xl border p-4 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold">
                    {session.browser} • {session.os}
                  </h4>

                  <p className="mt-1 text-sm text-muted-foreground">{session.device}</p>

                  <p className="text-xs text-muted-foreground">{session.ipAddress}</p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(session.createdAt).toLocaleString()}
                  </p>
                </div>

                {session.current ? (
                  <Badge>Current</Badge>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-20 text-xs text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-800"
                    onClick={() => onSignOut(session.id)}
                  >
                    Sign out
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <DrawerFooter>
          <ConfirmDialog
            title="Sign out of all other sessions?"
            description="This will sign you out of all other devices except the current one."
            confirmText="Sign Out Others"
            variant="destructive"
            loading={signingOutOthers}
            onConfirm={onSignOutOthers}
            trigger={
              <Button
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-100 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600"
              >
                Sign Out All Other Sessions
              </Button>
            }
          />

          <DrawerClose asChild>
            <Button variant="ghost">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
