// import { rabbitMQ } from "./rabbitmq.ts";

// export class Consumer {

//     async consume<T>(
//         queue: string,
//         callback: (payload: T) => Promise<void>,
//     ) {

//         const channel = rabbitMQ.getChannel();

//         await channel.assertQueue(queue, {
//             durable: true,
//         });

//         channel.consume(queue, async (message) => {

//             if (!message) return;

//             const payload = JSON.parse(
//                 message.content.toString(),
//             ) as T;

//             try {

//                 await callback(payload);

//                 channel.ack(message);

//             } catch (error) {

//                 console.error(error);

//                 channel.nack(message);

//             }

//         });

//     }

// }

// export const consumer = new Consumer();

import { rabbitMQ } from "./rabbitmq.ts";

export class Consumer {

    async consume<T>(
        exchange: string,
        routingKey: string,
        queue: string,
        callback: (payload: T) => Promise<void>,
    ) {

        const channel = rabbitMQ.getChannel();

        // 1. Tạo exchange
        await channel.assertExchange(
            exchange,
            "topic",
            {
                durable: true,
            },
        );

        // 2. Tạo queue
        await channel.assertQueue(
            queue,
            {
                durable: true,
            },
        );

        // 3. Bind queue vào exchange
        await channel.bindQueue(
            queue,
            exchange,
            routingKey,
        );

        // 4. Consume
        await channel.consume(
            queue,
            async (message) => {

                if (!message) return;

                const payload = JSON.parse(
                    message.content.toString(),
                ) as T;

                try {

                    await callback(payload);

                    channel.ack(message);

                } catch (error) {

                    console.error(error);

                    channel.nack(message, false, true);

                }

            },
        );

    }

}

export const consumer = new Consumer();