import websocket from '@fastify/websocket';
import fp from 'fastify-plugin';

import {
  startWebSocketSubscriber,
} from './subscriber.ts';

import {
  websocketManager,
} from './manager.ts';

export default fp(async (app) => {
  await app.register(websocket);

  await startWebSocketSubscriber();

  app.get(
    '/ws',
    {
      websocket: true,
      preValidation: [
        app.authenticate,
      ],
    },
    (socket, request) => {
      const userId =
        request.user.id;

      websocketManager.add(
        userId,
        socket,
      );

      socket.on('close', () => {
        websocketManager.remove(
          userId,
          socket,
        );
      });

      socket.on('error', () => {
        websocketManager.remove(
          userId,
          socket,
        );
      });
    },
  );

  console.log('✅ WebSocket server registered');
});