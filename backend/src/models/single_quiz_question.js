'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SingleQuizQuestion extends Model {
    static associate(models) {
      // Định nghĩa các association nếu cần, ví dụ:
      // SingleQuizQuestion.belongsTo(models.QuestionType, { foreignKey: 'question_type_id' });
    }
  }
  SingleQuizQuestion.init({
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
    // Lưu danh sách đường dẫn hình ảnh dưới dạng JSON (mảng string)
    question_images: {
      type: DataTypes.JSON,
      allowNull: true
    },
    labelA: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'labelA' // Chỉ định tên cột trong cơ sở dữ liệu là 'labelA'
    },
    labelB: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'labelB' // Chỉ định tên cột là 'labelB'
    },
    labelC: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'labelC'
    },
    labelD: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'labelD'
    },
    // Lưu đáp án chính xác, ví dụ: "labelA", "labelB",...
    correct_label: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'correct_label'
    },
    solution: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'solution'
    }
  }, {
    sequelize,
    modelName: 'SingleQuizQuestion',
    tableName: 'single_quiz_questions',
    timestamps: false, // Nếu không cần lưu created_at và updated_at; đổi thành true nếu cần
    underscored: true // Các trường khác sẽ tự chuyển đổi, nhưng các trường có chỉ định field sẽ giữ nguyên
  });
  return SingleQuizQuestion;
};
