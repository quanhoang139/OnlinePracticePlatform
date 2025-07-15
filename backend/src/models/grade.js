'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Grade extends Model {
    static associate(models) {
      // Định nghĩa các associations nếu cần, ví dụ:
      // Grade.hasMany(models.Exam, { foreignKey: 'grade_id' });
    }
  }
  Grade.init({
    grade_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    grade_name_vi: {
      type: DataTypes.STRING,
      allowNull: false
    },
    grade_name_en: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Grade',
    tableName: 'grades',
    timestamps: true,     // Tự động tạo created_at và updated_at
    underscored: true     // Sử dụng snake_case cho created_at, updated_at
  });
  return Grade;
};
