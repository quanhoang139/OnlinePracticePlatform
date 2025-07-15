const gradeService = require('../services/gradeService');

const getAllGrades = async (req, res) => {
    try {
        const grades = await gradeService.getAllGrades();
        res.json(grades);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getGradeById = async (req, res) => {
    try {
        const { id } = req.params;
        const grade = await gradeService.getGradeById(id);
        if (!grade) return res.status(404).json({ message: 'Grade not found' });
        res.json(grade);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const createGrade = async (req, res) => {
    try {
        const { grade_name_vi, grade_name_en } = req.body;
        if (!grade_name_vi || !grade_name_en) {
            return res.status(400).json({ message: 'Both grade_name_vi and grade_name_en are required' });
        }

        const newGrade = await gradeService.createGrade({ grade_name_vi, grade_name_en });

        res.status(201).json({ message: 'Grade created successfully', data: newGrade });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateGrade = async (req, res) => {
    try {
        const { id } = req.params;
        const { grade_name_vi, grade_name_en } = req.body;
        const updatedGrade = await gradeService.updateGrade(id, { grade_name_vi, grade_name_en });

        if (!updatedGrade) return res.status(404).json({ message: 'Grade not found' });

        res.json({ message: 'Grade updated successfully', data: updatedGrade });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const deleteGrade = async (req, res) => {
    try {
        const { id } = req.params;
        const isDeleted = await gradeService.deleteGrade(id);

        if (!isDeleted) return res.status(404).json({ message: 'Grade not found' });

        res.json({ message: 'Grade deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    getAllGrades,
    getGradeById,
    createGrade,
    updateGrade,
    deleteGrade
};
