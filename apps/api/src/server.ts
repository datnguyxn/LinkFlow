import 'dotenv/config';
import { loadEnv } from './config/env/index.js';
import { buildApp } from './app.js';

const env = loadEnv();

const app = await buildApp();

app.listen({
  port: env.PORT,
}).then(() => {
  console.log(`Server is running on port ${env.PORT}`);
});