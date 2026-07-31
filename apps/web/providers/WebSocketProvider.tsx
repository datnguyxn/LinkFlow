'use client';

import { useEffect } from 'react';

import { websocketClient } from '@/lib/websocket/websocket-client';
import { config } from '@/config';

export function WebSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
  console.log('🟢 WebSocketProvider MOUNT');

  const url = `${config.NEXT_PUBLIC_WS_URL}/ws`;

  websocketClient.connect(url);

  return () => {
    console.log('🔴 WebSocketProvider UNMOUNT');

    websocketClient.disconnect();
  };
}, []);

  return children;
}