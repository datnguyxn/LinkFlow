'use client';

import { useEffect } from 'react';

import { websocketClient } from '@/lib/websocket/websocket-client';

export function useWebSocket(
  handler: (message: {
    event: string;
    data?: unknown;
  }) => void,
) {
  useEffect(() => {
    return websocketClient.subscribe(handler);
  }, [handler]);
}