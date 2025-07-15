'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_feedback_question', {
      feedback_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      source_question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'all_questions',
          key: 'question_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      recommended_question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'all_questions',
          key: 'question_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      feedback_value: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_feedback_question');
  }
};