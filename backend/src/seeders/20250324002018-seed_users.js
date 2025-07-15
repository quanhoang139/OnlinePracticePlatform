'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('admin123', 10); // Hash password

    return queryInterface.bulkInsert('users', [
      {
        username: 'admin',
        password: hashedPassword,
        email: 'admin1@example.com',
        first_name: 'Admin',
        last_name: 'One',
        phone_number: '1111111111',
        gender: 'Nam',
        role_id: 1,  // Admin role
        school: 'System',
        grade_id: 7,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        username: 'admin1',
        password: hashedPassword,
        email: 'admin2@example.com',
        first_name: 'Admin',
        last_name: 'Two',
        phone_number: '9999999999',
        gender: 'Nữ',
        role_id: 1,  // Admin role
        school: 'System',
        grade_id: 4,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', { role_id: 1 }, {});
  }
};
