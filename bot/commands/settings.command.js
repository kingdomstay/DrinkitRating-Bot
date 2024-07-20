import {Composer} from "telegraf";

// Обработка команды /settings
import {User} from "../../models/index.js";
//import {getUserSettings, updateUserSettings} from "../../controllers/settings.controller.js";
import {Markup} from "telegraf";
import {getUserChannels, updateUserChannel} from "../../controllers/settings.controller.js";

const settingsCommand = Composer.command('settings', async (ctx) => {
    const telegramId = ctx.from.id;

    try {
        const user = await User.findOne({where: {telegramId}})
        if (!user) throw new Error('User not found')

        const { selectedChannels, coffeeShops } = await getUserChannels(user.id)


        const keyboard = coffeeShops.map(shop => {
            const isSelected = selectedChannels.includes(String(shop.id))

            return Markup.button.callback(
                    `${isSelected ? '✅ ' : ''}${shop.displayName}`,
                    `toggle_shop_${shop.id}`
                );
        })

        ctx.reply('На какие кофейни хочешь подписаться?', Markup.inlineKeyboard(keyboard));
    } catch (error) {
        console.error('Error fetching settings:', error);
        ctx.reply('Произошла ошибка при загрузке настроек.');
    }
});

// Обработка действий пользователя
const settingsToggleShop = Composer.action(/toggle_shop_(\d+)/, async (ctx) => {
    const telegramId = ctx.from.id;
    const coffeeShopId = parseInt(ctx.match[1]);

    try {
        const user = await User.findOne({ where: { telegramId } });
        if (!user) throw new Error('User not found');

        await updateUserChannel(user.id, coffeeShopId);

        ctx.answerCbQuery('Настройки обновлены успешно.');

        const { selectedChannels, coffeeShops } = await getUserChannels(user.id)


        const keyboard = coffeeShops.map(shop => {
            const isSelected = selectedChannels.includes(String(shop.id))

            return Markup.button.callback(
                `${isSelected ? '✅ ' : ''}${shop.displayName}`,
                `toggle_shop_${shop.id}`
            );
        })
        ctx.editMessageText('На какие кофейни хочешь подписаться?', Markup.inlineKeyboard(keyboard));
    } catch (error) {
        console.error('Error updating settings:', error);
        ctx.answerCbQuery('Произошла ошибка при обновлении настроек.');
    }
});

export {settingsCommand, settingsToggleShop}
