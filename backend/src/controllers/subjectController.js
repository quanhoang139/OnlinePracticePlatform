const subjectService = require('../services/subjectService');

const getAllSubjects = async (req, res) => {
    try {
        const subjects = await subjectService.getAllSubjects();
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getSubjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const subject = await subjectService.getSubjectById(id);
        if (!subject) return res.status(404).json({ message: 'Subject not found' });
        res.json(subject);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const createSubject = async (req, res) => {
    try {
        const { subject_name_vi, subject_name_en, subject_icon_active, subject_icon_inactive } = req.body;
        if (!subject_name_vi || !subject_name_en) {
            return res.status(400).json({ message: 'Both subject_name_vi and subject_name_en are required' });
        }

        const newSubject = await subjectService.createSubject({
            subject_name_vi,
            subject_name_en,
            subject_icon_active,
            subject_icon_inactive
        });

        res.status(201).json({ message: 'Subject created successfully', data: newSubject });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const { subject_name_vi, subject_name_en, subject_icon_active, subject_icon_inactive } = req.body;
        const updatedSubject = await subjectService.updateSubject(id, {
            subject_name_vi,
            subject_name_en,
            subject_icon_active,
            subject_icon_inactive
        });

        if (!updatedSubject) return res.status(404).json({ message: 'Subject not found' });

        res.json({ message: 'Subject updated successfully', data: updatedSubject });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const isDeleted = await subjectService.deleteSubject(id);

        if (!isDeleted) return res.status(404).json({ message: 'Subject not found' });

        res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    getAllSubjects,
    getSubjectById,
    createSubject,
    updateSubject,
    deleteSubject
};
