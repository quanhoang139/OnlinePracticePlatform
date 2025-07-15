'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class BlackListToken extends Model {
        static associate(models) {
            // Không cần quan hệ với bảng User
        }
    }

    BlackListToken.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            token: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            expiresAt: { // Giữ nguyên expiresAt, thêm field option `field`
                type: DataTypes.DATE,
                allowNull: false,
                field: "expiresAt", // Chỉ rõ tên cột trong database
            },
        },
        {
            sequelize,
            modelName: 'BlackListToken',
            tableName: 'black_list_tokens',
            timestamps: false,
            underscored: true
        }
    );

    return BlackListToken;
};
