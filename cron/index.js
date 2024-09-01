import cron from 'node-cron';
import {bot} from "../bot/bot.js";
import {User} from "../models/index.js";
import {requestFeedbacks, sendFeedbackToUsers} from "../controllers/feedback.controller.js";
import {updateToken} from "../utils/api.js";

cron.schedule('0 */12 * * *', async () => {
    try {
        await updateToken()
        await bot.telegram.sendMessage('531134665', 'Токен был обновлен');
        console.log('Токен был обновлен');
    } catch (error) {
        console.error('Error sending scheduled message:', error);
    }
});

cron.schedule('*/5 7-20 * * *', async () => {
    console.log('[CRON] Запускается процесс опроса')
    await requestFeedbacks()
    await sendFeedbackToUsers()
    console.log('[CRON] Опрос окончен, сообщения с поступившими отзывами отправлены')
})

console.log('[CRON] Initialized')
