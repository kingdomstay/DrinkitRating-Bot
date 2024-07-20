import { Sequelize, DataTypes } from 'sequelize';
import CoffeeShopModel from './coffeeShop.model.js';
import UserModel from './user.model.js';
import ChannelsModel from "./channels.model.js";

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './bot.db' // Замените 'your_database.db' на путь к вашей базе данных SQLite
});

// Определение моделей
const CoffeeShop = CoffeeShopModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);
const Channels = ChannelsModel(sequelize, DataTypes)


User.belongsToMany(CoffeeShop, {through: Channels});
CoffeeShop.belongsToMany(User, {through: Channels});

// Экспорт моделей и экземпляра Sequelize
export { sequelize, CoffeeShop, User, Channels };
