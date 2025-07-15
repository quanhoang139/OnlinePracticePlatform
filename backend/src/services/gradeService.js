const { Grade } = require('../models');

const getAllGrades = async () => {
    console.log('call api getAllGrades')
    return await Grade.findAll();
};

const getGradeById = async (id) => {
    return await Grade.findByPk(id);
};

const createGrade = async (data) => {
    return await Grade.create(data);
};

const updateGrade = async (id, data) => {
    const grade = await Grade.findByPk(id);
    if (!grade) return null;
    await grade.update(data);
    return grade;
};

const deleteGrade = async (id) => {
    const grade = await Grade.findByPk(id);
    if (!grade) return false;
    await grade.destroy();
    return true;
};

module.exports = {
    getAllGrades,
    getGradeById,
    createGrade,
    updateGrade,
    deleteGrade
};
