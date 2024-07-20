import {CoffeeShop, Channels} from '../models/index.js';

export async function getUserChannels(userId) {
    try {
        const userChannels = await Channels.findAll({where: {userId}})
        const coffeeShops = await CoffeeShop.findAll();

        const selectedChannels = userChannels.map(item => String(item.CoffeeShopId));

        return {selectedChannels, coffeeShops}
    } catch (error) {
        throw new Error('Error fetching settings')
    }
}

export async function updateUserChannel(userId, coffeeShopId) {
    try {
        console.log(userId, coffeeShopId)
        const userChannel = await Channels.findOne({ where: { userId, coffeeShopId } })
        console.log(userChannel)
        if (userChannel) {
            await userChannel.destroy();
        } else {
            await Channels.upsert({ UserId: String(userId), CoffeeShopId: String(coffeeShopId)})
        }
    } catch (error) {
        throw new Error(error)
    }
}
