import {getFeedbacks} from "../utils/api.js";
import {CoffeeShop, Feedbacks} from "../models/index.js";
import {bot} from "../bot/bot.js";
import 'dotenv/config'

export async function requestFeedbacks() {
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
            const { unitId, feedbackComment, orderRate } = review;
            const shopId = shopMapping[unitId];

            if (!acc[shopId]) {
                acc[shopId] = [];
            }

            acc[shopId].push({ feedbackComment, orderRate });
            return acc;
        }, {});

        return groupedFeedbacks;
    } catch (err) {
        throw new Error(`Error: ${err}`);
    }
}
