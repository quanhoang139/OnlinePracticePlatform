const questionTypeService = require('../services/questionTypeService');

const getAllQuestionTypes = async (req, res) => {
    try {
        const questionTypes = await questionTypeService.getAllQuestionTypes();
        res.json(questionTypes);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getQuestionTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const questionType = await questionTypeService.getQuestionTypeById(id);
        if (!questionType) return res.status(404).json({ message: 'Question type not found' });
        res.json(questionType);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const createQuestionType = async (req, res) => {
    try {
        const { question_type_name, question_type_name_vi, question_type_name_en, question_type_description_vi, question_type_description_en } = req.body;
        
        if (!question_type_name || !question_type_name_vi || !question_type_name_en) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newQuestionType = await questionTypeService.createQuestionType({
            question_type_name,
            question_type_name_vi,
            question_type_name_en,
            question_type_description_vi,
            question_type_description_en
        });

        res.status(201).json({ message: 'Question type created successfully', data: newQuestionType });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateQuestionType = async (req, res) => {
    try {
        const { id } = req.params;
        const { question_type_name, question_type_name_vi, question_type_name_en, question_type_description_vi, question_type_description_en } = req.body;

        const updatedQuestionType = await questionTypeService.updateQuestionType(id, {
            question_type_name,
            question_type_name_vi,
            question_type_name_en,
            question_type_description_vi,
            question_type_description_en
        });

        if (!updatedQuestionType) return res.status(404).json({ message: 'Question type not found' });

        res.json({ message: 'Question type updated successfully', data: updatedQuestionType });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const deleteQuestionType = async (req, res) => {
    try {
        const { id } = req.params;
        const isDeleted = await questionTypeService.deleteQuestionType(id);

        if (!isDeleted) return res.status(404).json({ message: 'Question type not found' });

        res.json({ message: 'Question type deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    getAllQuestionTypes,
    getQuestionTypeById,
    createQuestionType,
    updateQuestionType,
    deleteQuestionType
};
