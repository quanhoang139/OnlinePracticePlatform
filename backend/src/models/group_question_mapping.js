'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GroupQuestionMapping extends Model {
    static associate(models) {
      // Nếu có các association cần định nghĩa, ví dụ:
      GroupQuestionMapping.belongsTo(models.QuestionGroup, { foreignKey: 'group_id', as: 'questionGroup'  });
      // GroupQuestionMapping.belongsTo(models.QuestionType, { foreignKey: 'question_type_id' });
    }
  }
  GroupQuestionMapping.init({
    mapping_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    group_id: {
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
    order_in_group: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'GroupQuestionMapping',
    tableName: 'group_question_mapping',
    timestamps: false,  // Bỏ qua created_at và updated_at nếu không cần
    underscored: true
  });
  return GroupQuestionMapping;
};
