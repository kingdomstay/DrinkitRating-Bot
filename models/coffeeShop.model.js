const CoffeeShopModel = (sequelize, DataTypes) => {
    return sequelize.define('CoffeeShop', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        displayName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        UUID: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'coffee_shops',
        timestamps: false
    });
};

export default CoffeeShopModel
