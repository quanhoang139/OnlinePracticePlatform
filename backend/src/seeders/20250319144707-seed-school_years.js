'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Truy vấn các school_year_value đã có trong bảng school_years
    const existingSchoolYears = await queryInterface.sequelize.query(
      "SELECT school_year_value FROM school_years;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingValues = existingSchoolYears.map(item => item.school_year_value);

    // Dữ liệu cần seed cho bảng school_years
    const newSchoolYears = [
      { school_year_value: "1999-2000", created_at: new Date(), updated_at: new Date() },
      { school_year_value: "2000-2001", created_at: new Date(), updated_at: new Date() },
      { school_year_value: "2001-2002", created_at: new Date(), updated_at: new Date() },
      { school_year_value: "2002-2003", created_at: new Date(), updated_at: new Date() },
      { school_year_value: "2005-2006", created_at: new Date(), updated_at: new Date() },
      { school_year_value: "2006-2007", created_at: new Date(), updated_at: new Date() },
      { school_year_value: "2007-2008", created_at: new Date(), updated_at: new Date() },
      { school_year_value: "2008-2009", created_at: new Date(), updated_at: new Date() },
      { school_year_value: "2009-2010", created_at: new Date(), updated_at: new Date() },
      { school_year_value: "2010-2011", created_at: new Date(), updated_at: new Date() },
      { school_year_value: "2011-2012", created_at: new Date(), updated_at: new Date() }, 
      { school_year_value: "2012-2013", created_at: new Date(), updated_at: new Date() },
      { school_year_value: "2013-2014", created_at: new Date(), updated_at: new Date() },
      { school_year_value: "2014-2015", created_at: new Date(), updated_at: new Date() },
      { school_year_value: "2015-2016", created_at: new Date(), updated_at: new Date() },
      { school_year_value: "2016-2017", created_at: new Date(), updated_at: new Date() },
      { school_year_value: "2017-2018", created_at: new Date(), updated_at: new Date() },
      { school_year_value: "2018-2019", created_at: new Date(), updated_at: new Date() },
      { school_year_value: "2019-2020", created_at: new Date(), updated_at: new Date() },
      { school_year_value: "2020-2021", created_at: new Date(), updated_at: new Date() },
      { school_year_value: "2021-2022", created_at: new Date(), updated_at: new Date() },
      { school_year_value: "2022-2023", created_at: new Date(), updated_at: new Date() },
      { school_year_value: "2023-2024", created_at: new Date(), updated_at: new Date() },
      { school_year_value: "2024-2025", created_at: new Date(), updated_at: new Date() }
    ];

    // Lọc ra các school_year chưa có trong bảng dựa trên school_year_value
    const filteredSchoolYears = newSchoolYears.filter(item => !existingValues.includes(item.school_year_value));

    // Nếu có dữ liệu mới thì thực hiện bulkInsert
    if (filteredSchoolYears.length > 0) {
      await queryInterface.bulkInsert('school_years', filteredSchoolYears, {});
    }

    // Hiển thị cảnh báo nếu có bản ghi bị bỏ qua do trùng lặp
    if (filteredSchoolYears.length < newSchoolYears.length) {
      console.warn("Some school years were already in the database and were skipped.");
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('school_years', null, {});
  }
};
