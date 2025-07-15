const { SchoolYear } = require('../models');

const getAllSchoolYears = async () => {
    console.log('call api getAllSchoolYears')
    return await SchoolYear.findAll();
};

const getSchoolYearById = async (id) => {
    return await SchoolYear.findByPk(id);
};

const createSchoolYear = async (data) => {
    return await SchoolYear.create(data);
};

const updateSchoolYear = async (id, data) => {
    const schoolYear = await SchoolYear.findByPk(id);
    if (!schoolYear) return null;
    await schoolYear.update(data);
    return schoolYear;
};

const deleteSchoolYear = async (id) => {
    const schoolYear = await SchoolYear.findByPk(id);
    if (!schoolYear) return false;
    await schoolYear.destroy();
    return true;
};

module.exports = {
    getAllSchoolYears,
    getSchoolYearById,
    createSchoolYear,
    updateSchoolYear,
    deleteSchoolYear
};
