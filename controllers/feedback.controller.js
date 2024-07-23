import {getFeedbacks} from "../utils/api.js";
import {Channels, CoffeeShop, Feedbacks, User} from "../models/index.js";
import {bot} from "../bot/bot.js";
import 'dotenv/config'
import {pre} from "telegraf/format";
import {where} from "sequelize";

export async function requestFeedbacks() {
    try {
        const coffeeShops = await CoffeeShop.findAll();
        const listShops = coffeeShops.map(shop => String(shop.UUID))

        // Получение комментариев
        let feedbacks = await getFeedbacks(true, listShops)
        console.log(feedbacks)

        // ⚠ Из системы Dodo IS приходят дубли с отзывами, проверяем их
        let lastOrderId = '';

        for (const feedback of feedbacks) {
            const [data, created] = await Feedbacks.findOrCreate( {
                where: { orderId: feedback.orderId },
                defaults: {
                    unitId: feedback.unitId,
                    countryCode: feedback.countryCode,
                    orderId: feedback.orderId,
                    orderNumber: feedback.orderNumber,
                    orderCreatedAt: feedback.orderCreatedAt,
                    orderRate: feedback.orderRate,
                    feedbackComment: feedback.feedbackComment,
                    feedbackCreatedAt: feedback.feedbackCreatedAt,
                    sended: 0
                }})
            if (created) {
                console.log('Создана новая запись')
                lastOrderId = feedback.orderId
            } else if (feedback.orderId === lastOrderId) {
                await bot.telegram.sendMessage(process.env.BOT_SERVICE_GROUP_ID, 'Возник дубль, проверяю следующий отзыв')
            }
        }
        await bot.telegram.sendMessage(process.env.BOT_SERVICE_GROUP_ID, 'Отзывов с комментариями больше нет, перехожу к отзывам без комментариев')

        // Получение комментариев
        feedbacks = await getFeedbacks(false, listShops)
        console.log(feedbacks)

        // ⚠ Из системы Dodo IS приходят дубли с отзывами, проверяем их
        lastOrderId = '';

        for (const feedback of feedbacks) {
            const [data, created] = await Feedbacks.findOrCreate( {
                where: { orderId: feedback.orderId },
                defaults: {
                    unitId: feedback.unitId,
                    countryCode: feedback.countryCode,
                    orderId: feedback.orderId,
                    orderNumber: feedback.orderNumber,
                    orderCreatedAt: feedback.orderCreatedAt,
                    orderRate: feedback.orderRate,
                    feedbackCreatedAt: feedback.feedbackCreatedAt,
                    sended: 0
                }})
            if (created) {
                console.log('Создана новая запись')
                lastOrderId = feedback.orderId
            } else if (feedback.orderId === lastOrderId) {
                await bot.telegram.sendMessage('-4205295241', `${feedback.orderId}=${lastOrderId}: Дубль`)
            }
        }

        await bot.telegram.sendMessage('-4205295241', 'Все отзывы обработаны')
    } catch (err) {
        throw Error (`Error: ${err}`)
    }
}

export async function prepareSendFeedback() {
    try {
        const feedbacks = await Feedbacks.findAll({ where: { sended: 0 } });

        // Получаем все UUID из отзывов
        const unitIds = feedbacks.map(feedback => feedback.unitId);

        // Ищем все кофейни разом, чтобы не делать много запросов
        const shops = await CoffeeShop.findAll({ where: { UUID: unitIds } });

        // Создаем маппинг UUID -> shop.id
        const shopMapping = shops.reduce((acc, shop) => {
            acc[shop.UUID] = shop.id;
            return acc;
        }, {});

        // Группируем отзывы по shop.id
        const groupedFeedbacks = feedbacks.reduce((acc, review) => {
            const { unitId, feedbackComment, orderRate, orderCreatedAt, orderNumber } = review;
            const shopId = shopMapping[unitId];

            if (!acc[shopId]) {
                acc[shopId] = [];
            }

            acc[shopId].push({ orderCreatedAt, orderNumber, feedbackComment, orderRate });
            return acc;
        }, {});

        return groupedFeedbacks;
    } catch (err) {
        throw new Error(`Error: ${err}`);
    }
}

export async function sendFeedbackToUsers() {
    try {
        const groupedFeedbacks = await prepareSendFeedback();
        const channels = await Channels.findAll();

        for (const channel of channels) {
            const shopId = parseInt(channel.CoffeeShopId)
            if (groupedFeedbacks[shopId]) {
                const shop = await CoffeeShop.findOne({ where: { id: shopId } })
                let generatedMessage = `<b>Новые отзывы с ${shop.displayName}:</b>\n\n\n`
                for (const feedback of groupedFeedbacks[shopId]) {
                    generatedMessage += `${feedback.orderRate? '✅ Положительный отзыв': '❌ Негативный отзыв'}\nНомер заказа: ${feedback.orderNumber}\n${feedback.feedbackComment? 'Комментарий: ' + feedback.feedbackComment: 'Нет комментария'}\n\n`
                }
                console.log('Work')
                console.log(groupedFeedbacks[shopId])
                const {chatId} = await User.findOne({ where: { id: channel.UserId } })
                await bot.telegram.sendMessage(chatId, `${generatedMessage}`, {parse_mode: "HTML"});
            }
            await Feedbacks.update( { sended: 1 }, { where: { sended: 0 } })
        }
    } catch (err) {
        throw Error(`Error: ${err}`)
    }
}

// Функция для отправки сообщений пользователям
/*
export async function sendFeedbackToUsers() {
    try {
        const groupedFeedbacks = await prepareSendFeedback();
        console.log(groupedFeedbacks);

        const channels = await Channels.findAll();

        const userFeedbacks = channels.reduce((acc, channel) => {
            const userId = channel.UserId; // Исправлено для доступа к userId
            const coffeeShopId = channel.CoffeeShopId; // Исправлено для доступа к coffeeShopId

            console.log(channel.UserId)

            if (groupedFeedbacks[coffeeShopId]) {
                if (!acc[userId]) {
                    acc[userId] = [];
                }
                acc[userId].push(...groupedFeedbacks[coffeeShopId]);
            }

            return acc;
        }, {});

        console.log(userFeedbacks);
        console.log('Тут?')

        for (const userId in userFeedbacks) {
            // Проверка корректности обработки
            console.log('РАБОТАЕТ?');
            console.log(`ааааааа ${userId}`);
            const feedbacks = userFeedbacks[userId];

            if (feedbacks.length > 0) {
                const feedbackText = feedbacks.map(fb => `Comment: ${fb.feedbackComment}\nRating: ${fb.orderRate}`).join('\n\n');

                const {chatId} = await User.findOne({ where: { id: userId } })

                await bot.telegram.sendMessage(chatId, `Here are your feedbacks:\n\n${feedbackText}`);

                // Отметим отзывы как отправленные
                await Feedbacks.update(
                    { sended: 1 },
                    { where: { unitId: { [Op.in]: feedbacks.map(fb => fb.unitId) } } }
                );
            }
        }
    } catch (err) {
        console.error(`Error sending feedback to users: ${err.message}`);
    }
}
*/
