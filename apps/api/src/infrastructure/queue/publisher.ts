import { rabbitMQ } from "./rabbitmq.ts";

export class Publisher {

    async publish<T>(
        queue: string,
        payload: T,
    ) {

        const channel = rabbitMQ.getChannel();

        await channel.assertQueue(queue, {
            durable: true,
        });

        channel.sendToQueue(
            queue,
            Buffer.from(JSON.stringify(payload)),
            {
                persistent: true,
            },
        );

    }

}

export const publisher = new Publisher();