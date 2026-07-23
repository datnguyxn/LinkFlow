import {
  redisSubscriber,
} from '../cache/subscriber.ts';

import {
  websocketManager,
} from './manager.ts';

import { REDIS_CHANNEL } from '../../common/constants/index.ts';

export async function startWebSocketSubscriber() {
  await redisSubscriber.subscribe(
    REDIS_CHANNEL.NOTIFICATION_CREATED,
    (message) => {
      const data = JSON.parse(message);

      websocketManager.sendToUser(
        data.userId,
        {
          event: REDIS_CHANNEL.NOTIFICATION_CREATED,
          data: data.notification,
        },
      );
    },
  );

  console.log(
    '✅ WebSocket Redis subscriber started',
  );
}