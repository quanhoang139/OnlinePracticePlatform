'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SingleEssayQuestion extends Model {
    static associate(models) {
      // Định nghĩa các association nếu cần, ví dụ:
      // SingleEssayQuestion.belongsTo(models.QuestionType, { foreignKey: 'question_type_id' });
    }
  }
  SingleEssayQuestion.init({
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
    // Lưu danh sách các đường dẫn ảnh dưới dạng JSON (mảng string)
    question_images: {
      type: DataTypes.JSON,
      allowNull: true
    },
    solution: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'SingleEssayQuestion',
    tableName: 'single_essay_questions',
    timestamps: false,  // Nếu không cần lưu created_at và updated_at; đổi thành true nếu cần
    underscored: true
  });
  return SingleEssayQuestion;
};
