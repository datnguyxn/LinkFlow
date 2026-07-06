import 'dotenv/config';
import { config } from './config/env/index.js';
import { buildApp } from './app.js';

const app = await buildApp();

app
  .listen({
    port: config.PORT,
  })
  .then(() => {
    console.log(`Server is running on port ${config.PORT}`);
  });
