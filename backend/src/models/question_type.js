'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QuestionType extends Model {
    static associate(models) {
      // Định nghĩa các association nếu cần, ví dụ:
      // QuestionType.hasMany(models.SingleQuestion, { foreignKey: 'question_type_id' });
    }
  }
  QuestionType.init({
    question_type_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    question_type_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    question_type_name_vi: {
      type: DataTypes.STRING,
      allowNull: false
    },
    question_type_name_en: {
      type: DataTypes.STRING,
      allowNull: false
    },
    question_type_description_vi: {
      type: DataTypes.STRING,
      allowNull: true
    },
    question_type_description_en: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'QuestionType',
    tableName: 'question_types',
    timestamps: true,   // Tự động tạo created_at và updated_at
    underscored: true   // Sử dụng snake_case cho các cột tự động (created_at, updated_at)
  });
  return QuestionType;
};
