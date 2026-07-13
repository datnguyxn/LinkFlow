import amqp, { type Channel } from 'amqplib';
import { config } from '../../config/env/index.ts';

class RabbitMQ {
  private connection!: Awaited<ReturnType<typeof amqp.connect>>;
  private channel!: Channel;

  async connect() {
    this.connection = await amqp.connect(config.RABBITMQ_URL);

    this.channel = await this.connection.createChannel();

    console.log('✅ RabbitMQ Connected');
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
