'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Truy vấn các exam_term_name_vi đã có trong bảng exam_terms
    const existingExamTerms = await queryInterface.sequelize.query(
      "SELECT exam_term_name_vi FROM exam_terms;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingNames = existingExamTerms.map(item => item.exam_term_name_vi);

    // Dữ liệu cần seed cho bảng exam_terms
    const newExamTerms = [
      { exam_term_name_vi: "Chất lượng đầu năm", exam_term_name_en: "Beginning of Year Quality Assessment", created_at: new Date(), updated_at: new Date() },
      { exam_term_name_vi: "Cuối kỳ I", exam_term_name_en: "End of Semester I", created_at: new Date(), updated_at: new Date() },
      { exam_term_name_vi: "Cuối kỳ II", exam_term_name_en: "End of Semester II", created_at: new Date(), updated_at: new Date() },
      { exam_term_name_vi: "Đánh giá năng lực", exam_term_name_en: "Competency Assessment", created_at: new Date(), updated_at: new Date() },
      { exam_term_name_vi: "Đánh giá tư duy", exam_term_name_en: "Thinking Ability Assessment", created_at: new Date(), updated_at: new Date() },
      { exam_term_name_vi: "Giữa kỳ I", exam_term_name_en: "Mid-Semester I", created_at: new Date(), updated_at: new Date() },
      { exam_term_name_vi: "Giữa kỳ II", exam_term_name_en: "Mid-Semester II", created_at: new Date(), updated_at: new Date() },
      { exam_term_name_vi: "IELTS", exam_term_name_en: "IELTS", created_at: new Date(), updated_at: new Date() },
      { exam_term_name_vi: "Ôn tập chương", exam_term_name_en: "Chapter Review", created_at: new Date(), updated_at: new Date() },
      { exam_term_name_vi: "Pop quiz", exam_term_name_en: "Pop Quiz", created_at: new Date(), updated_at: new Date() },
      { exam_term_name_vi: "Thi học sinh giỏi", exam_term_name_en: "Excellent Student Exam", created_at: new Date(), updated_at: new Date() },
      { exam_term_name_vi: "Thi THPT", exam_term_name_en: "High School Graduation Exam", created_at: new Date(), updated_at: new Date() },
      { exam_term_name_vi: "Thi vào lớp 10", exam_term_name_en: "High School Entrance Exam", created_at: new Date(), updated_at: new Date() },
      { exam_term_name_vi: "TOEIC", exam_term_name_en: "TOEIC", created_at: new Date(), updated_at: new Date() },
      { exam_term_name_vi: "VNU TEST", exam_term_name_en: "VNU TEST", created_at: new Date(), updated_at: new Date() }
    ];

    // Lọc ra các exam term chưa tồn tại trong bảng dựa trên exam_term_name_vi
    const filteredExamTerms = newExamTerms.filter(term => !existingNames.includes(term.exam_term_name_vi));

    // Nếu có dữ liệu mới thì thực hiện bulkInsert
    if (filteredExamTerms.length > 0) {
      await queryInterface.bulkInsert('exam_terms', filteredExamTerms, {});
    }

    // Hiển thị cảnh báo nếu có bản ghi bị bỏ qua do trùng lặp
    if (filteredExamTerms.length < newExamTerms.length) {
      console.warn("Some exam terms were already in the database and were skipped.");
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('exam_terms', null, {});
  }
};