const express = require('express');
const router = express.Router();
const examTermController = require('../controllers/examTermController');
const { authenticateToken, authorizeAdmin } = require("../middlewares/authMiddleware");

router.get('/', examTermController.getAllExamTerms);
router.get('/:id', examTermController.getExamTermById);
router.post('/', authenticateToken, authorizeAdmin, examTermController.createExamTerm);
router.put('/:id', authenticateToken, authorizeAdmin, examTermController.updateExamTerm);
router.delete('/:id', authenticateToken, authorizeAdmin, examTermController.deleteExamTerm);

module.exports = router;
