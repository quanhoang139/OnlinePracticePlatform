const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const { authenticateToken, authorizeAdmin } = require("../middlewares/authMiddleware");

router.get('/', gradeController.getAllGrades);
router.get('/:id', gradeController.getGradeById);
router.post('/', authenticateToken, authorizeAdmin, gradeController.createGrade);
router.put('/:id', authenticateToken, authorizeAdmin, gradeController.updateGrade);
router.delete('/:id', authenticateToken, authorizeAdmin, gradeController.deleteGrade);

module.exports = router;
