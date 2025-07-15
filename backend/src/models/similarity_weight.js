'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SimilarityWeight extends Model {
    static associate(models) {
      SimilarityWeight.belongsTo(models.Question, {
        foreignKey: 'source_question_id',
        as: 'SourceQuestion'
      });
      SimilarityWeight.belongsTo(models.Question, {
        foreignKey: 'recommended_question_id',
        as: 'RecommendedQuestion'
      });
    }
  }

  SimilarityWeight.init({
    source_question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    recommended_question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    adjusted_weight: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00
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
    modelName: 'SimilarityWeight',
    tableName: 'question_similarity_weights',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return SimilarityWeight;
};