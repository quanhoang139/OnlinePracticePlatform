const { QuestionType } = require('../models');

const getAllQuestionTypes = async () => {
    return await QuestionType.findAll();
};

const getQuestionTypeById = async (id) => {
    return await QuestionType.findByPk(id);
};

const createQuestionType = async (data) => {
    return await QuestionType.create(data);
};

const updateQuestionType = async (id, data) => {
    const questionType = await QuestionType.findByPk(id);
    if (!questionType) return null;
    await questionType.update(data);
    return questionType;
};

const deleteQuestionType = async (id) => {
    const questionType = await QuestionType.findByPk(id);
    if (!questionType) return false;
    await questionType.destroy();
    return true;
};

module.exports = {
    getAllQuestionTypes,
    getQuestionTypeById,
    createQuestionType,
    updateQuestionType,
    deleteQuestionType
};
