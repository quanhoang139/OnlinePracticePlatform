const express = require('express');
const router = express.Router();
const schoolYearController = require('../controllers/schoolYearController');
const { authenticateToken, authorizeAdmin } = require("../middlewares/authMiddleware");

router.get('/', schoolYearController.getAllSchoolYears);
router.get('/:id', schoolYearController.getSchoolYearById);
router.post('/', authenticateToken, authorizeAdmin, schoolYearController.createSchoolYear);
router.put('/:id', authenticateToken, authorizeAdmin, schoolYearController.updateSchoolYear);
router.delete('/:id', authenticateToken, authorizeAdmin, schoolYearController.deleteSchoolYear);

module.exports = router;
