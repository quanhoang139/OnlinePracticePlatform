'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Định nghĩa các association nếu cần, ví dụ:
      // Role.hasMany(models.User, { foreignKey: 'role_id' });
    }
  }
  
  Role.init({
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    role_name_vi: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role_name_en: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role_description_vi: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role_description_en: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    timestamps: true,   // Tự động thêm created_at và updated_at
    underscored: true   // Sử dụng kiểu snake_case cho tên cột
  });
  return Role;
};
