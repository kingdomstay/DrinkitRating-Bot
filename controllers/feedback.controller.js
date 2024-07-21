import {getFeedbacks} from "../utils/api.js";
import {CoffeeShop, Feedbacks} from "../models/index.js";
import {bot} from "../bot/bot.js";

export async function requestFeedbacks() {
    const coffeeShops = await CoffeeShop.findAll();
    const listShops = coffeeShops.map(shop => String(shop.UUID))

    // Получение комментариев
    const feedbacks = await getFeedbacks(true, listShops)
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
            await bot.telegram.sendMessage('-4205295241', 'Возник дубль, проверяю следующий отзыв')
        } else {
            console.log('Новых записей больше нет')
            break
        }
    }
    await bot.telegram.sendMessage('-4205295241', 'Новых записей больше нет!')
}
