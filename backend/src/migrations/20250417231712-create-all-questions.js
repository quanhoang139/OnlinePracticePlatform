'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Xóa bảng nếu đã tồn tại
    //await queryInterface.dropTable('all_questions', { cascade: true });

    // Tạo bảng all_questions
    await queryInterface.createTable('all_questions', {
      question_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      question_original_id: {
        type: Sequelize.INTEGER,
        allowNull: true
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
      question_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'question_types',
          key: 'question_type_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      group_content: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      question_content: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      embedding_content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      vector_embedding: {
        type: Sequelize.JSON,
        allowNull: true
      },
      is_recommended: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Xóa bảng khi rollback
    await queryInterface.dropTable('all_questions', { cascade: true });
  }
};