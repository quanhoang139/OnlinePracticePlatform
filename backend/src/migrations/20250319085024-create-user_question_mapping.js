'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_question_mapping', {
      mapping_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
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
      user_choice: {
        type: Sequelize.STRING,
        allowNull: true
      },
      user_answer: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      submitted_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      session_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'user_exam_mapping', key: 'mapping_id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_question_mapping');
  }
};
