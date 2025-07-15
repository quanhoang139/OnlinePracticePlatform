'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Feedback extends Model {
    static associate(models) {
      Feedback.belongsTo(models.User, { foreignKey: 'user_id' });
      Feedback.belongsTo(models.Question, {
        foreignKey: 'source_question_id',
        as: 'SourceQuestion'
      });
      Feedback.belongsTo(models.Question, {
        foreignKey: 'recommended_question_id',
        as: 'RecommendedQuestion'
      });
    }
  }

  Feedback.init({
    feedback_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    source_question_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    recommended_question_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    feedback_value: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Feedback',
    tableName: 'user_feedback_question',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Feedback;
};