'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SchoolYear extends Model {
    static associate(models) {
      // Định nghĩa associations nếu cần, ví dụ:
      // SchoolYear.hasMany(models.Exam, { foreignKey: 'school_year_id' });
    }
  }
  SchoolYear.init({
    school_year_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    school_year_value: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'SchoolYear',
    tableName: 'school_years',
    timestamps: true,    // Tự động tạo created_at và updated_at
    underscored: true    // Sử dụng snake_case cho created_at, updated_at
  });
  return SchoolYear;
};
