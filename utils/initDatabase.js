import {CoffeeShop, sequelize} from '../models/index.js'

const initDatabase = async () => {
    try {
        await sequelize.sync();

/*        await CoffeeShop.bulkCreate([
            { displayName: 'W-Plaza', UUID: 'FE009D98F69B87A011ED6A59445CF1FF' },
            { displayName: 'Лефорт', UUID: '5A04948968239BCB11EE891A4AAC5635' },
            { displayName: 'Барклай', UUID: '4A97380A12CA944311EEDC6E7460035A' }
        ]);*/

        console.log('[DB] Synchronized');
    } catch (error) {
        console.error('[DB] Unable to synchronize the database:', error);
    }
}

export default initDatabase;
