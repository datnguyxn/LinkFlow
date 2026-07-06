import amqp, { type Channel } from "amqplib";
import { loadEnv } from "../../config/env/index.ts";

class RabbitMQ {

    private connection!: Awaited<ReturnType<typeof amqp.connect>>;
    private channel!: Channel;
    private env: ReturnType<typeof loadEnv>;
    
    constructor() {
        this.env = loadEnv();
    }
    async connect() {

        this.connection = await amqp.connect(
            this.env.RABBITMQ_URL
        );

        this.channel = await this.connection.createChannel();

        console.log("✅ RabbitMQ Connected");
    }

    getChannel() {
        return this.channel;
    }

    async close() {
        await this.channel.close();
        await this.connection.close();
    }

}

export const rabbitMQ = new RabbitMQ();