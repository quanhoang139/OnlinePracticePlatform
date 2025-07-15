'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const existingSubjects = await queryInterface.sequelize.query(
      "SELECT subject_name_vi FROM subjects;",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const existingNames = existingSubjects.map(subject => subject.subject_name_vi);

    const newSubjects = [
      {
        subject_name_vi: "Tất cả",
        subject_name_en: "All",
        subject_icon_active: "https://dicamon.vn/_next/static/media/all-active.657a8b67.svg",
        subject_icon_inactive: "https://dicamon.vn/_next/static/media/all.0ce4bde9.svg",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        subject_name_vi: "Toán học",
        subject_name_en: "Mathematics",
        subject_icon_active: "https://dicamon.vn/_next/static/media/math-active.67c0d2ab.svg",
        subject_icon_inactive: "https://dicamon.vn/_next/static/media/math.22c7b379.svg",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        subject_name_vi: "Địa lí",
        subject_name_en: "Geography",
        subject_icon_active: "https://dicamon.vn/_next/static/media/geography-active.3e9ac199.svg",
        subject_icon_inactive: "https://dicamon.vn/_next/static/media/geography.cd4265c8.svg",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        subject_name_vi: "Sinh học",
        subject_name_en: "Biology",
        subject_icon_active: "https://dicamon.vn/_next/static/media/biology-active.4a70cba4.svg",
        subject_icon_inactive: "https://dicamon.vn/_next/static/media/biology.61dc4ca3.svg",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        subject_name_vi: "Ngữ văn",
        subject_name_en: "Literature",
        subject_icon_active: "https://dicamon.vn/_next/static/media/literature-active.b4d28820.svg",
        subject_icon_inactive: "https://dicamon.vn/_next/static/media/literature.24ff2a19.svg",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        subject_name_vi: "Vật lí",
        subject_name_en: "Physics",
        subject_icon_active: "https://dicamon.vn/_next/static/media/physics-active.6ac829ed.svg",
        subject_icon_inactive: "https://dicamon.vn/_next/static/media/physics.ff094889.svg",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        subject_name_vi: "Lịch sử",
        subject_name_en: "History",
        subject_icon_active: "https://dicamon.vn/_next/static/media/history-active.06a8af8e.svg",
        subject_icon_inactive: "https://dicamon.vn/_next/static/media/history.30e0d2af.svg",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        subject_name_vi: "Hóa học",
        subject_name_en: "Chemistry",
        subject_icon_active: "https://dicamon.vn/_next/static/media/chemistry-active.e2bd47a9.svg",
        subject_icon_inactive: "https://dicamon.vn/_next/static/media/chemistry.be0de430.svg",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        subject_name_vi: "Giáo dục công dân",
        subject_name_en: "Civic Education",
        subject_icon_active: "https://dicamon.vn/_next/static/media/civic-edu-active.5a610e8e.svg",
        subject_icon_inactive: "https://dicamon.vn/_next/static/media/civic-edu.a3f025a4.svg",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        subject_name_vi: "Tiếng Anh",
        subject_name_en: "English",
        subject_icon_active: "https://dicamon.vn/_next/static/media/english-active.0de0b803.svg",
        subject_icon_inactive: "https://dicamon.vn/_next/static/media/english.03d59d0c.svg",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        subject_name_vi: "Tin học",
        subject_name_en: "Computer Science",
        subject_icon_active: "https://dicamon.vn/_next/static/media/computer-active.b028378c.svg",
        subject_icon_inactive: "https://dicamon.vn/_next/static/media/computer.93c3d345.svg",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        subject_name_vi: "Công nghệ",
        subject_name_en: "Technology",
        subject_icon_active: "https://dicamon.vn/_next/static/media/technology-active.26f2bc2b.svg",
        subject_icon_inactive: "https://dicamon.vn/_next/static/media/technology.ca878bcb.svg",
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    const filteredSubjects = newSubjects.filter(subject => !existingNames.includes(subject.subject_name_vi));

    if (filteredSubjects.length > 0) {
      await queryInterface.bulkInsert('subjects', filteredSubjects, {});
    }

    if (filteredSubjects.length < newSubjects.length) {
      console.warn("Some subjects were already in the database and were skipped.");
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('subjects', null, {});
  }
};
