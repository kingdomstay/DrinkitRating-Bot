import {Telegraf} from 'telegraf';
import 'dotenv/config'
import { User} from "../models/index.js";
import {settingsCommand, settingsToggleShop} from "./commands/settings.command.js";
import {requestFeedbacks, sendFeedbackToUsers} from "../controllers/feedback.controller.js";
import {updateToken} from "../utils/api.js";

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Middleware для обработки ошибок
bot.catch((err, ctx) => {
    console.error(`Error for ${ctx.updateType}`, err);

    // Проверка на ошибку, связанной с блокировкой бота пользователем
    if (err.code === 403 && err.description === 'Forbidden: bot was blocked by the user') {
        console.log(`User ${ctx.from.id} blocked the bot.`);
        // Тут можно добавить код для удаления пользователя из базы данных или другую логику
    } else {
        console.error('Unhandled error:', err);
    }
});

// Обработчики команд
bot.start(async (ctx) => {
    const username = ctx.message.from.username;
    if (!username) {
        return ctx.reply('Привет! Чтобы воспользоваться ботом понадобится имя пользователя')
    }
    const chatId = ctx.chat.id;

    const [user, created] = await User.findOrCreate({ where: {chatId, username} });
    if (created) {
        ctx.reply(`Привет, ${ctx.message.from.first_name}! Посмотри доступные команды через /help`);
    } else {
        // Заглушка
        ctx.reply(`Ты продолжаешь получать отзывы из кофеен!`)
    }
});


// Settings
bot.use(settingsCommand, settingsToggleShop)

bot.help(ctx => {
    ctx.replyWithMarkdown(`*Держи список доступных команд:*\n\n/help - Раздел со всеми командами _(ты здесь находишься)_\n/settings - Настройка подписок на отзывы из кофеен\n/stop - Приостановить получение отзывов\n/start - Продолжить их получение`)
})

bot.command('stop', (ctx) => {
    ctx.reply('Ты приостановил получение отзывов. Захочешь продолжить, пиши /start')
})
bot.command('request', (ctx) => {
    // Заглушка
    requestFeedbacks()
})
bot.command('refresh', async (ctx) => {
    const tokens = await updateToken()
    ctx.reply('Токен был обновлен')
})
bot.command('send', async (ctx) => {
    // Заглушка
    await sendFeedbackToUsers()
})

// Обработчик неизвестных запросов
bot.on('text', (ctx) => {
    const text = ctx.message.text.toLowerCase();

    if (text.startsWith('/')) {
        // Неизвестная команда
        ctx.reply('Я не знаю такой команды. Посмотри доступные через /help');
    } else {
        // Неизвестный текст
        ctx.reply('Прости, не понял тебя. Посмотри, что я умею через /help')
    }
});

// Запуск бота
bot.launch()
    .then(() => console.log('[BOT] Started'))
    .catch(err => console.error('[BOT] Launch error:', err));

process.once('SIGINT', () => {bot.stop('SIGINT'); console.log('Test')});
process.once('SIGTERM', () => {bot.stop('SIGTERM'); console.log('Test')});

export { bot };
