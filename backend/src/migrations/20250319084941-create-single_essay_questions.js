'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('single_essay_questions', {
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
      point: {
        type: Sequelize.DECIMAL(5,2),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // Lưu danh sách các đường dẫn ảnh dưới dạng JSON
      question_images: {
        type: Sequelize.JSON,
        allowNull: true
      },
      solution: {
        type: Sequelize.TEXT,
        allowNull: false
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('single_essay_questions');
  }
};
