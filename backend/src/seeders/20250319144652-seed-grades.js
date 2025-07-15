'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Truy vấn các grade_name_vi đã có trong bảng grades
    const existingGrades = await queryInterface.sequelize.query(
      "SELECT grade_name_vi FROM grades;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingNames = existingGrades.map(grade => grade.grade_name_vi);

    // Dữ liệu cần seed
    const newGrades = [
      { grade_name_vi: "Lớp 6", grade_name_en: "Grade 6", created_at: new Date(), updated_at: new Date() },
      { grade_name_vi: "Lớp 7", grade_name_en: "Grade 7", created_at: new Date(), updated_at: new Date() },
      { grade_name_vi: "Lớp 8", grade_name_en: "Grade 8", created_at: new Date(), updated_at: new Date() },
      { grade_name_vi: "Lớp 9", grade_name_en: "Grade 9", created_at: new Date(), updated_at: new Date() },
      { grade_name_vi: "Lớp 10", grade_name_en: "Grade 10", created_at: new Date(), updated_at: new Date() },
      { grade_name_vi: "Lớp 11", grade_name_en: "Grade 11", created_at: new Date(), updated_at: new Date() },
      { grade_name_vi: "Lớp 12", grade_name_en: "Grade 12", created_at: new Date(), updated_at: new Date() }
    ];

    // Lọc ra các grade không tồn tại trong bảng
    const filteredGrades = newGrades.filter(grade => !existingNames.includes(grade.grade_name_vi));

    // Nếu có dữ liệu mới thì thực hiện bulkInsert
    if (filteredGrades.length > 0) {
      await queryInterface.bulkInsert('grades', filteredGrades, {});
    }

    // Cảnh báo nếu có một số bản ghi bị bỏ qua do trùng lặp
    if (filteredGrades.length < newGrades.length) {
      console.warn("Some grades were already in the database and were skipped.");
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('grades', null, {});
  }
};