'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('exams', {
      exam_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      exam_title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      exam_term_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'exam_terms',
          key: 'exam_term_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      school_year_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'school_years',
          key: 'school_year_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      school: {
        type: Sequelize.STRING,
        allowNull: true
      },
      grade_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'grades',
          key: 'grade_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      subject_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'subjects',
          key: 'subject_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      original_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true
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
    await queryInterface.dropTable('exams');
  }
};
