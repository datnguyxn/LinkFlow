import { rabbitMQ } from './rabbitmq.ts';

// export class Publisher {

//     async publish<T>(
//         queue: string,
//         payload: T,
//     ) {

//         const channel = rabbitMQ.getChannel();

//         await channel.assertQueue(queue, {
//             durable: true,
//         });

//         channel.sendToQueue(
//             queue,
//             Buffer.from(JSON.stringify(payload)),
//             {
//                 persistent: true,
//             },
//         );

//     }

// }

// export const publisher = new Publisher();

export class Publisher {
  async publish<T>(exchange: string, routingKey: string, payload: T) {
    const channel = rabbitMQ.getChannel();

    await channel.assertExchange(exchange, 'topic', {
      durable: true,
    });

    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });
  }
}
