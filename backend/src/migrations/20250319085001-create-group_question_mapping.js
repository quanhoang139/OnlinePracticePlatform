'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('group_question_mapping', {
      mapping_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      group_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'question_groups', key: 'id' },
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
      order_in_group: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('group_question_mapping');
  }
};
