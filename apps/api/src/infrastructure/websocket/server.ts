import websocket from '@fastify/websocket';
import fp from 'fastify-plugin';

import { startWebSocketSubscriber } from './subscriber.ts';

import { websocketManager } from './manager.ts';

export default fp(async (app) => {
  await app.register(websocket);

  await startWebSocketSubscriber();

  app.get(
    '/ws',
    {
      websocket: true,
    },
    async (socket, request) => {
      console.log('[WS] CLIENT CONNECTED');
      const { token } = request.query as {
        token?: string;
      };

      if (!token) {
        socket.close(1008, 'Unauthorized');
        return;
      }

      const user = await app.jwt.verify<{
        id: string;
      }>(token);

      websocketManager.add(user.id, socket);

      socket.on('close', (code, reason) => {
        console.log('[WS] CLIENT CLOSED', {
          code,
          reason: reason.toString(),
        });

        websocketManager.remove(user.id, socket);
      });

      socket.on('error', (error) => {
        console.error('[WS] SOCKET ERROR', error);
        websocketManager.remove(user.id, socket);
      });
    },
  );

  console.log('✅ WebSocket server registered');
});
