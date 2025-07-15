const { Sequelize } = require('sequelize');


// Option 3: Passing parameters separately (other dialects)
const sequelize = new Sequelize('exam_web', 'root', null, {
    host: 'localhost',
    dialect: 'mysql',
    timezone: "+07:00",
    logging: false,
    pool: {
        max: 10, // Số kết nối tối đa trong pool
        min: 0,  // Số kết nối tối thiểu
        acquire: 30000, // Thời gian tối đa (ms) để cố gắng lấy kết nối trước khi báo lỗi
        idle: 10000 // Thời gian tối đa (ms) một kết nối có thể nhàn rỗi trước khi bị đóng
    }
});

let DBConfig = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

module.exports = DBConfig