import cron from 'node-cron';
import {bot} from "../bot/bot.js";
import {User} from "../models/index.js";

cron.schedule('0 */12 * * *', async () => {
    try {
        const users = await User.findAll();
        for (const user of users) {
            await bot.telegram.sendMessage(user.chatId, 'Это сообщение отправляется каждые 12 часов');
        }
        console.log('Scheduled message sent successfully.');
    } catch (error) {
        console.error('Error sending scheduled message:', error);
    }
});

console.log('[CRON] Initialized')
