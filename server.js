import Fastify from 'fastify';
import { bot } from './bot/bot.js';
import 'dotenv/config'
import './cron/index.js';
import initDatabase from "./utils/initDatabase.js";

const fastify = Fastify({ logger: true });

// Эндпоинт для вебхука
fastify.post('/bot', async (request, reply) => {
    await bot.handleUpdate(request.body, reply.raw);
    return reply.send({ status: 'ok' });
});

// Запуск сервера
const startServer = async () => {
    try {
        await fastify.listen({ port: process.env.FASTIFY_PORT, host: process.env.FASTIFY_HOST });
        console.log(`[SERVER] Started on ${process.env.FASTIFY_HOST}:${process.env.FASTIFY_PORT}`);

        // Установка вебхука
        await bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}/bot`);
        console.log('[WEBHOOK] Selected');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

await startServer();
await initDatabase();
