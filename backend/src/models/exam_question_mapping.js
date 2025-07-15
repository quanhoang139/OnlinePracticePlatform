'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ExamQuestionMapping extends Model {
    static associate(models) {
      // Ví dụ định nghĩa các association nếu cần:
      ExamQuestionMapping.belongsTo(models.Exam, { foreignKey: 'exam_id', as: 'exam' });
      // ExamQuestionMapping.belongsTo(models.QuestionType, { foreignKey: 'question_type_id' });
    }
  }
  ExamQuestionMapping.init({
    mapping_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    exam_id: {
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
    order_in_exam: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ExamQuestionMapping',
    tableName: 'exam_question_mapping',
    timestamps: false, // Không sử dụng created_at và updated_at
    underscored: true
  });
  return ExamQuestionMapping;
};
