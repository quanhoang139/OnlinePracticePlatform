const schoolYearService = require('../services/schoolYearService');

const getAllSchoolYears = async (req, res) => {
    try {
        const schoolYears = await schoolYearService.getAllSchoolYears();
        res.json(schoolYears);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getSchoolYearById = async (req, res) => {
    try {
        const { id } = req.params;
        const schoolYear = await schoolYearService.getSchoolYearById(id);
        if (!schoolYear) return res.status(404).json({ message: 'School Year not found' });
        res.json(schoolYear);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const createSchoolYear = async (req, res) => {
    try {
        const { school_year_value } = req.body;
        if (!school_year_value) {
            return res.status(400).json({ message: 'school_year_value is required' });
        }

        const newSchoolYear = await schoolYearService.createSchoolYear({ school_year_value });

        res.status(201).json({ message: 'School Year created successfully', data: newSchoolYear });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateSchoolYear = async (req, res) => {
    try {
        const { id } = req.params;
        const { school_year_value } = req.body;
        const updatedSchoolYear = await schoolYearService.updateSchoolYear(id, { school_year_value });

        if (!updatedSchoolYear) return res.status(404).json({ message: 'School Year not found' });

        res.json({ message: 'School Year updated successfully', data: updatedSchoolYear });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const deleteSchoolYear = async (req, res) => {
    try {
        const { id } = req.params;
        const isDeleted = await schoolYearService.deleteSchoolYear(id);

        if (!isDeleted) return res.status(404).json({ message: 'School Year not found' });

        res.json({ message: 'School Year deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    getAllSchoolYears,
    getSchoolYearById,
    createSchoolYear,
    updateSchoolYear,
    deleteSchoolYear
};
