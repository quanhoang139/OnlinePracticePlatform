const express = require('express');
const router = express.Router();
const questionTypeController = require('../controllers/questionTypeController');
const { authenticateToken, authorizeAdmin } = require("../middlewares/authMiddleware");

router.get('/', questionTypeController.getAllQuestionTypes);
router.get('/:id', questionTypeController.getQuestionTypeById);
router.post('/', authenticateToken, authorizeAdmin, questionTypeController.createQuestionType);
router.put('/:id', authenticateToken, authorizeAdmin, questionTypeController.updateQuestionType);
router.delete('/:id', authenticateToken, authorizeAdmin, questionTypeController.deleteQuestionType);

module.exports = router;
