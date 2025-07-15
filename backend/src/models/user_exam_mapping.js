'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserExamMapping extends Model {
    static associate(models) {
      // Ví dụ định nghĩa associations nếu cần:
      // UserExamMapping.belongsTo(models.User, { foreignKey: 'user_id' });
      // UserExamMapping.belongsTo(models.Exam, { foreignKey: 'exam_id' });
      UserExamMapping.belongsTo(models.Exam, { foreignKey: 'exam_id', as: 'exam' });
      UserExamMapping.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  UserExamMapping.init({
    mapping_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    exam_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    total_score: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false
    },
    converted_score: {
      type:  DataTypes.DECIMAL(5,2),
      allowNull: true, 
      defaultValue: null,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    time_taken: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'UserExamMapping',
    tableName: 'user_exam_mapping',
    timestamps: false,  // Vì đã lưu riêng start_time và submitted_at
    underscored: true
  });
  return UserExamMapping;
};
