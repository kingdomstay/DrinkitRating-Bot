const FeedbackModel = (sequelize, DataTypes) => {
    return sequelize.define('Feedback', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        unitId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        countryCode: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        orderId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        orderNumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        orderCreatedAt: {
            type: DataTypes.STRING,
            allowNull: false
        },
        orderRate: {
            type: DataTypes.TINYINT,
            allowNull: false
        },
        feedbackComment: {
            type: DataTypes.STRING,
            allowNull: true
        },
        feedbackCreatedAt: {
            type: DataTypes.STRING,
            allowNull: false
        },
        sended: {
            type: DataTypes.TINYINT,
            allowNull: false,
            default: 0
        }
    }, {
        tableName: 'feedbacks',
        timestamps: true
    });
};

export default FeedbackModel
