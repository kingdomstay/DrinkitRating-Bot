import cron from 'node-cron';
import {bot} from "../bot/bot.js";
import {User} from "../models/index.js";
import {requestFeedbacks, sendFeedbackToUsers} from "../controllers/feedback.controller.js";

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

cron.schedule('*/5 7-20 * * *', async () => {
    console.log('[CRON] Запускается процесс опроса')
    await requestFeedbacks()
    await sendFeedbackToUsers()
    console.log('[CRON] Опрос окончен, сообщения с поступившими отзывами отправлены')
})

console.log('[CRON] Initialized')
