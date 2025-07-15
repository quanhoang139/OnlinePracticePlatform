'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('question_types', {
      question_type_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      question_type_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      question_type_name_vi: {
        type: Sequelize.STRING,
        allowNull: false
      },
      question_type_name_en: {
        type: Sequelize.STRING,
        allowNull: false
      },
      question_type_description_vi: {
        type: Sequelize.STRING,
        allowNull: true
      },
      question_type_description_en: {
        type: Sequelize.STRING,
        allowNull: true
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
    await queryInterface.dropTable('question_types');
  }
};
