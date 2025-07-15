'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserQuestionMapping extends Model {
    static associate(models) {
      // Các association có thể định nghĩa ở đây:
      // UserQuestionMapping.belongsTo(models.User, { foreignKey: 'user_id' });
      // UserQuestionMapping.belongsTo(models.QuestionType, { foreignKey: 'question_type_id' });
      // UserQuestionMapping.belongsTo(models.UserExamMapping, { foreignKey: 'session_id' });
    }
  }
  UserQuestionMapping.init({
    mapping_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    question_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_choice: {
      type: DataTypes.STRING,
      allowNull: true
    },
    user_answer: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    session_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_file: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null
    }
  }, {
    sequelize,
    modelName: 'UserQuestionMapping',
    tableName: 'user_question_mapping',
    timestamps: false, // Vì chúng ta lưu riêng submitted_at
    underscored: true
  });
  return UserQuestionMapping;
};

