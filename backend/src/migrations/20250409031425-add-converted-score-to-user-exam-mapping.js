"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("user_exam_mapping", "converted_score", {
      type: Sequelize.DECIMAL(5,2),
      allowNull: true, // Cho phép null vì giá trị sẽ được cập nhật sau
      defaultValue: null,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("user_exam_mapping", "converted_score");
  },
};