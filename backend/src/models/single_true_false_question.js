'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SingleTrueFalseQuestion extends Model {
    static associate(models) {
      // Định nghĩa các association nếu cần, ví dụ:
      // SingleTrueFalseQuestion.belongsTo(models.QuestionType, { foreignKey: 'question_type_id' });
    }
  }
  SingleTrueFalseQuestion.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    point: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Lưu danh sách đường dẫn ảnh dưới dạng JSON (mảng string)
    question_images: {
      type: DataTypes.JSON,
      allowNull: true
    },
    correct_answer: {
      type: DataTypes.STRING,
      allowNull: false
    },
    solution: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'SingleTrueFalseQuestion',
    tableName: 'single_true_false_questions',
    timestamps: false, // Nếu không cần lưu created_at và updated_at; đổi thành true nếu cần
    underscored: true
  });
  return SingleTrueFalseQuestion;
};
