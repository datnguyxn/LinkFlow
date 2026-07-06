import { rabbitMQ } from "./rabbitmq.ts";

export class Consumer {

    async consume<T>(
        queue: string,
        callback: (payload: T) => Promise<void>,
    ) {

        const channel = rabbitMQ.getChannel();

        await channel.assertQueue(queue, {
            durable: true,
        });

        channel.consume(queue, async (message) => {

            if (!message) return;

            const payload = JSON.parse(
                message.content.toString(),
            ) as T;

            try {

                await callback(payload);

                channel.ack(message);

            } catch (error) {

                console.error(error);

                channel.nack(message);

            }

        });

    }

}

export const consumer = new Consumer();