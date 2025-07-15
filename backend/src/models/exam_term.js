'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ExamTerm extends Model {
    static associate(models) {
      // Định nghĩa associations nếu cần, ví dụ:
      // ExamTerm.hasMany(models.Exam, { foreignKey: 'exam_term_id' });
    }
  }
  ExamTerm.init({
    exam_term_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    exam_term_name_vi: {
      type: DataTypes.STRING,
      allowNull: false
    },
    exam_term_name_en: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ExamTerm',
    tableName: 'exam_terms',
    timestamps: true,    // Tự động tạo created_at và updated_at
    underscored: true    // Sử dụng snake_case cho created_at, updated_at
  });
  return ExamTerm;
};
