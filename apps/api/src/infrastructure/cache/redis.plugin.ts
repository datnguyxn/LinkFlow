import fp from "fastify-plugin";
import { redis } from "./redis.ts";

export default fp(async (app) => {

    await redis.connect();

    app.decorate("redis", redis);

    app.addHook("onClose", async () => {
        await redis.disconnect();
    });

});