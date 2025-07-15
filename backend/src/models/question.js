'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      Question.belongsTo(models.Subject, { foreignKey: 'subject_id' });
      Question.belongsTo(models.QuestionType, { foreignKey: 'question_type_id' });
      Question.belongsTo(models.Grade, { foreignKey: 'grade_id' });
    }
  }

  Question.init({
    question_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    question_original_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    grade_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    question_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    group_content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    question_content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    embedding_content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    vector_embedding: {
      type: DataTypes.JSON,
      allowNull: true
    },
    is_recommended: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Question',
    tableName: 'all_questions',
    timestamps: false
  });

  return Question;
};