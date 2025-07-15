'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('single_quiz_questions', {
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
      question_images: {
        // Sử dụng kiểu JSON để lưu danh sách các đường dẫn ảnh
        type: Sequelize.JSON,
        allowNull: true
      },
      labelA: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      labelB: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      labelC: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      labelD: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      correct_label: {
        type: Sequelize.STRING,
        allowNull: false
      },
      solution: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('single_quiz_questions');
  }
};
