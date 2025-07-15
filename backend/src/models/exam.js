'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Exam extends Model {
    static associate(models) {
      Exam.belongsTo(models.ExamTerm, { foreignKey: 'exam_term_id', as: 'examTerm' });
      Exam.belongsTo(models.Grade, { foreignKey: 'grade_id', as: 'grade' });
      Exam.belongsTo(models.Subject, { foreignKey: 'subject_id', as: 'subject' });
      Exam.belongsTo(models.SchoolYear, { foreignKey: 'school_year_id', as: 'schoolYear' });
    }
  }
  Exam.init({
    exam_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    exam_title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    exam_term_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    school_year_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    school: {
      type: DataTypes.STRING,
      allowNull: true
    },
    grade_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    original_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    }, 
    max_total_score: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false,
      defaultValue: 0,
    }
  }, {
    sequelize,
    modelName: 'Exam',
    tableName: 'exams',
    timestamps: true,     // Tự động tạo created_at và updated_at
    underscored: true     // Sử dụng snake_case cho các cột tự động (created_at, updated_at)
  });
  return Exam;
};
