'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('exam_question_mapping', {
      mapping_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      exam_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'exams', key: 'exam_id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      question_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'question_types', key: 'question_type_id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      order_in_exam: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('exam_question_mapping');
  }
};
