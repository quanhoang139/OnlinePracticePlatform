'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subject extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Định nghĩa association nếu cần, ví dụ:
      // Subject.hasMany(models.Exam, { foreignKey: 'subject_id' });
    }
  }
  Subject.init({
    subject_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    subject_name_vi: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subject_name_en: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subject_icon_active: {
      type: DataTypes.STRING,
      allowNull: true
    },
    subject_icon_inactive: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Subject',
    tableName: 'subjects',
    timestamps: true,    // Tự động tạo created_at và updated_at
    underscored: true    // Sử dụng định dạng snake_case cho các cột tự động (created_at, updated_at)
  });
  return Subject;
};
