'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('question_groups', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      group_content: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // Sử dụng kiểu JSON để lưu danh sách các đường dẫn ảnh
      group_images: {
        type: Sequelize.JSON,
        allowNull: true
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('question_groups');
  }
};
