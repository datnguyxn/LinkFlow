import { buildApp } from '../../../src/app.js';


export async function createTestApp() {
  const app = await buildApp({
    enableRabbitMQ: true,
    enableRedis: false,
    enableStorage: false,
    enableWebsocket: false,

    enableWorkers: false,
    enableJobs: false,
  });


  await app.ready();


  return app;
}