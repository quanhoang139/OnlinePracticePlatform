const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { authenticateToken, authorizeAdmin } = require("../middlewares/authMiddleware");

router.get('/', subjectController.getAllSubjects);
router.get('/:id', subjectController.getSubjectById);
router.post('/', authenticateToken, authorizeAdmin, subjectController.createSubject);
router.put('/:id', authenticateToken, authorizeAdmin, subjectController.updateSubject);
router.delete('/:id', authenticateToken, authorizeAdmin, subjectController.deleteSubject);

module.exports = router;
