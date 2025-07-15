'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QuestionGroup extends Model {
    static associate(models) {
      // Định nghĩa associations nếu cần, ví dụ:
      // QuestionGroup.hasMany(models.GroupQuestionMapping, { foreignKey: 'group_id' });
    }
  }
  QuestionGroup.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    group_content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Lưu danh sách đường dẫn ảnh dưới dạng JSON (mảng string)
    group_images: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'QuestionGroup',
    tableName: 'question_groups',
    timestamps: false,  // Bỏ qua created_at và updated_at nếu không cần thiết; đổi thành true nếu cần
    underscored: true
  });
  return QuestionGroup;
};
