const ChannelsModel = (sequelize, DataTypes) => {
    return sequelize.define('Channels', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
    }, {
        tableName: 'channels',
        timestamps: false
    });
};

export default ChannelsModel
