'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Lấy các vai trò hiện có trong cơ sở dữ liệu
    const existingRoles = await queryInterface.sequelize.query(
      "SELECT role_name_en FROM roles;",
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Trích xuất tên vai trò hiện có
    const existingNames = existingRoles.map(role => role.role_name_en);

    // Định nghĩa các vai trò mới
    const newRoles = [
      {
        role_name_vi: 'Quản trị viên',
        role_name_en: 'Admin',
        role_description_vi: 'Toàn quyền trên hệ thống',
        role_description_en: 'Full system access',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role_name_vi: 'Học sinh',
        role_name_en: 'Student',
        role_description_vi: 'Truy cập và làm các bài thi',
        role_description_en: 'Access and take exams',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role_name_vi: 'Giáo viên',
        role_name_en: 'Teacher',
        role_description_vi: 'Giám sát học sinh, mở lớp học, tạo đề thi/ca thi',
        role_description_en: 'Supervise students, open classes, create exams/sessions',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role_name_vi: 'Biên tập viên',
        role_name_en: 'Editor',
        role_description_vi: 'Chỉnh sửa đề thi và câu hỏi',
        role_description_en: 'Edit exams and questions',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role_name_vi: 'Người kiểm duyệt',
        role_name_en: 'Moderator',
        role_description_vi: 'Kiểm duyệt nội dung, chấm điểm tự luận',
        role_description_en: 'Moderate content, grade essays',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Lọc ra các vai trò chưa có trong cơ sở dữ liệu
    const filteredRoles = newRoles.filter(role => !existingNames.includes(role.role_name_en));

    // Chèn các vai trò mới vào bảng 'roles'
    if (filteredRoles.length > 0) {
      await queryInterface.bulkInsert('roles', filteredRoles, {});
    }

    // Thông báo nếu một số vai trò đã tồn tại
    if (filteredRoles.length < newRoles.length) {
      console.warn("Một số vai trò đã tồn tại trong cơ sở dữ liệu và đã bị bỏ qua.");
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Xóa tất cả các vai trò khỏi bảng 'roles'
    await queryInterface.bulkDelete('roles', null, {});
  }
};
