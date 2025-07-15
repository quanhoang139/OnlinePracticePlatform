const { Subject } = require('../models');

const getAllSubjects = async () => {
    console.log('call api getAllSubjects')
    return await Subject.findAll();
};

const getSubjectById = async (id) => {
    return await Subject.findByPk(id);
};

const createSubject = async (data) => {
    return await Subject.create(data);
};

const updateSubject = async (id, data) => {
    const subject = await Subject.findByPk(id);
    if (!subject) return null;
    await subject.update(data);
    return subject;
};

const deleteSubject = async (id) => {
    const subject = await Subject.findByPk(id);
    if (!subject) return false;
    await subject.destroy();
    return true;
};

module.exports = {
    getAllSubjects,
    getSubjectById,
    createSubject,
    updateSubject,
    deleteSubject
};
