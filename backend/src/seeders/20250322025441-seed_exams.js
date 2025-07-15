'use strict';
const path = require('path');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const data = require(path.join(__dirname, 'seed_exams.json'));
    const batchSize = 2000; 

    console.log(data.length)

    for (let i = 0; i < data.length; i += batchSize) {
      console.log(`🔄 Đang chèn batch từ ${i} đến ${i + batchSize - 1}...`);
      await queryInterface.bulkInsert('exams', data.slice(i, i + batchSize));
    }

    console.log("✅ Dữ liệu đã được chèn vào database!");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('exams', null, {});
  }
};