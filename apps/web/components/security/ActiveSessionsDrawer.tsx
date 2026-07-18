'use client';

import * as React from 'react';

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

  onSignOut?: (id: string) => void;
  onSignOutOthers?: () => void;
}

export default function ActiveSessionsDrawer({
  open,
  onOpenChange,
  sessions,
  onSignOut,
  onSignOutOthers,
}: Props) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-xl ml-auto h-full rounded-l-2xl rounded-r-none">
        <DrawerHeader>
          <DrawerTitle>Active Sessions</DrawerTitle>

          <DrawerDescription>Devices currently signed in to your account.</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="
                rounded-xl
                border
                p-4
                transition-colors
                hover:bg-muted/40
              "
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
                    className="text-xs text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-800 w-20"
                    onClick={() => onSignOut?.(session.id)}
                  >
                    Sign out
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <DrawerFooter>
          <Button variant="outline" onClick={onSignOutOthers}>
            Sign Out All Other Devices
          </Button>

          <DrawerClose asChild>
            <Button variant="ghost" className="ml-auto">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
