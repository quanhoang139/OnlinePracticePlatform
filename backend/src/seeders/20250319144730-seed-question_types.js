'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Truy vấn các question_type_name đã có trong bảng question_types
    const existingQuestionTypes = await queryInterface.sequelize.query(
      "SELECT question_type_name FROM question_types;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingNames = existingQuestionTypes.map(item => item.question_type_name);

    // Dữ liệu cần seed cho bảng question_types với mô tả bằng tiếng Việt và tiếng Anh
    const newQuestionTypes = [
      {
        question_type_name: "single_quiz_question",
        question_type_name_vi: "Câu hỏi trắc nghiệm đơn",
        question_type_name_en: "Single Quiz Question",
        question_type_description_vi: "Câu hỏi trắc nghiệm đơn lẻ, có một đáp án đúng.",
        question_type_description_en: "A single multiple-choice question with one correct answer.",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        question_type_name: "single_essay_question",
        question_type_name_vi: "Câu hỏi tự luận đơn",
        question_type_name_en: "Single Essay Question",
        question_type_description_vi: "Câu hỏi yêu cầu viết bài giải thích hoặc phân tích.",
        question_type_description_en: "An essay question requiring explanation or analysis.",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        question_type_name: "single_true_false_question",
        question_type_name_vi: "Câu hỏi đúng/sai đơn",
        question_type_name_en: "Single True/False Question",
        question_type_description_vi: "Câu hỏi xác định tính đúng đắn của một phát biểu.",
        question_type_description_en: "A question determining the correctness of a statement.",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        question_type_name: "group_quiz_question",
        question_type_name_vi: "Nhóm câu hỏi trắc nghiệm",
        question_type_name_en: "Group Quiz Question",
        question_type_description_vi: "Nhóm câu hỏi trắc nghiệm về một chủ đề.",
        question_type_description_en: "A group of multiple-choice questions on a topic.",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        question_type_name: "group_essay_question",
        question_type_name_vi: "Nhóm câu hỏi tự luận",
        question_type_name_en: "Group Essay Question",
        question_type_description_vi: "Nhóm câu hỏi tự luận về một chủ đề.",
        question_type_description_en: "A group of essay questions on a topic.",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        question_type_name: "group_true_false_question",
        question_type_name_vi: "Nhóm câu hỏi đúng/sai",
        question_type_name_en: "Group True/False Question",
        question_type_description_vi: "Nhóm câu hỏi đúng/sai về một chủ đề.",
        question_type_description_en: "A group of true/false questions on a topic.",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        question_type_name: "single_text_entry_question",
        question_type_name_vi: "Câu hỏi nhập văn bản đơn",
        question_type_name_en: "Single Text Entry Question",
        question_type_description_vi: "Câu hỏi yêu cầu nhập văn bản.",
        question_type_description_en: "A question requiring text input.",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        question_type_name: "group_text_entry_question",
        question_type_name_vi: "Nhóm câu hỏi nhập văn bản",
        question_type_name_en: "Group Text Entry Question",
        question_type_description_vi: "Nhóm câu hỏi yêu cầu nhập văn bản.",
        question_type_description_en: "A group of text entry questions.",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        question_type_name: "single_question",
        question_type_name_vi: "Câu hỏi đơn lẻ",
        question_type_name_en: "Single Question",
        question_type_description_vi: "Câu hỏi tổng hợp với nhiều dạng khác nhau.",
        question_type_description_en: "A single comprehensive question with various formats.",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        question_type_name: "group_question",
        question_type_name_vi: "Nhóm câu hỏi",
        question_type_name_en: "Group Question",
        question_type_description_vi: "Nhóm câu hỏi tổng hợp từ nhiều dạng khác nhau.",
        question_type_description_en: "A group of mixed-format questions.",
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Lọc ra các bản ghi chưa có trong bảng dựa trên question_type_name
    const filteredQuestionTypes = newQuestionTypes.filter(qt => !existingNames.includes(qt.question_type_name));

    // Nếu có dữ liệu mới thì thực hiện bulkInsert
    if (filteredQuestionTypes.length > 0) {
      await queryInterface.bulkInsert('question_types', filteredQuestionTypes, {});
    }

    // Hiển thị cảnh báo nếu có bản ghi bị bỏ qua do trùng lặp
    if (filteredQuestionTypes.length < newQuestionTypes.length) {
      console.warn("Some question types were already in the database and were skipped.");
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('question_types', null, {});
  }
};
