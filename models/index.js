import { Sequelize, DataTypes } from 'sequelize';
import CoffeeShopModel from './coffeeShop.model.js';
import UserModel from './user.model.js';
import ChannelsModel from "./channels.model.js";
import FeedbackModel from "./feedback.model.js";

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './bot.db',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Определение моделей
const CoffeeShop = CoffeeShopModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);
const Channels = ChannelsModel(sequelize, DataTypes)
const Feedbacks = FeedbackModel(sequelize, DataTypes)

User.belongsToMany(CoffeeShop, {through: Channels});
CoffeeShop.belongsToMany(User, {through: Channels});

// Экспорт моделей и экземпляра Sequelize
export { sequelize, CoffeeShop, User, Channels, Feedbacks };
