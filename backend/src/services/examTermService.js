const { ExamTerm } = require('../models');

const getAllExamTerms = async () => {
    console.log('call api getAllExamTerms')
    return await ExamTerm.findAll();
};

const getExamTermById = async (id) => {
    return await ExamTerm.findByPk(id);
};

const createExamTerm = async (data) => {
    return await ExamTerm.create(data);
};

const updateExamTerm = async (id, data) => {
    const examTerm = await ExamTerm.findByPk(id);
    if (!examTerm) return null;
    await examTerm.update(data);
    return examTerm;
};

const deleteExamTerm = async (id) => {
    const examTerm = await ExamTerm.findByPk(id);
    if (!examTerm) return false;
    await examTerm.destroy();
    return true;
};

module.exports = {
    getAllExamTerms,
    getExamTermById,
    createExamTerm,
    updateExamTerm,
    deleteExamTerm
};
