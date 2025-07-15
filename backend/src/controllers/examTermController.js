const examTermService = require('../services/examTermService');

const getAllExamTerms = async (req, res) => {
    try {
        const examTerms = await examTermService.getAllExamTerms();
        res.json(examTerms);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getExamTermById = async (req, res) => {
    try {
        const { id } = req.params;
        const examTerm = await examTermService.getExamTermById(id);
        if (!examTerm) return res.status(404).json({ message: 'Exam Term not found' });
        res.json(examTerm);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const createExamTerm = async (req, res) => {
    try {
        const { exam_term_name_vi, exam_term_name_en } = req.body;
        if (!exam_term_name_vi || !exam_term_name_en) {
            return res.status(400).json({ message: 'Both exam_term_name_vi and exam_term_name_en are required' });
        }

        const newExamTerm = await examTermService.createExamTerm({ exam_term_name_vi, exam_term_name_en });

        res.status(201).json({ message: 'Exam Term created successfully', data: newExamTerm });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateExamTerm = async (req, res) => {
    try {
        const { id } = req.params;
        const { exam_term_name_vi, exam_term_name_en } = req.body;
        const updatedExamTerm = await examTermService.updateExamTerm(id, { exam_term_name_vi, exam_term_name_en });

        if (!updatedExamTerm) return res.status(404).json({ message: 'Exam Term not found' });

        res.json({ message: 'Exam Term updated successfully', data: updatedExamTerm });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const deleteExamTerm = async (req, res) => {
    try {
        const { id } = req.params;
        const isDeleted = await examTermService.deleteExamTerm(id);

        if (!isDeleted) return res.status(404).json({ message: 'Exam Term not found' });

        res.json({ message: 'Exam Term deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    getAllExamTerms,
    getExamTermById,
    createExamTerm,
    updateExamTerm,
    deleteExamTerm
};
