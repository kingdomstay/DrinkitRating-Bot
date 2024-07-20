const UserModel = (sequelize, DataTypes) => {
    return sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        chatId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'users',
        timestamps: false
    });
};

export default UserModel
