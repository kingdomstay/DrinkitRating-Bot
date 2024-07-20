import {Telegraf} from 'telegraf';
import 'dotenv/config'
import { User} from "../models/index.js";
import {settingsCommand, settingsToggleShop} from "./commands/settings.command.js";

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Обработчики команд
bot.start(async (ctx) => {
    const username = ctx.message.from.username;
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
    // Заглушка
    ctx.reply('Ты приостановил получение отзывов. Захочешь продолжить, пиши /start')
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

export { bot };
