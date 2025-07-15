import express from "express";
import * as examController from "../controllers/examController.js";
const { authenticateToken, authorizeAdmin } = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");

const router = express.Router();



router.get("/:id", examController.getExamById);
router.put("/:id", authenticateToken, authorizeAdmin, examController.updateExam);
router.get("/original/:originalId", examController.getExamByOriginalId);
router.get("/", examController.getFilteredExams);
//GET http://localhost:8081/api/exams/?page=1&pageSize=10&sort=exam_title:ASC&filters={"$and":[{"grade.grade_name_vi":{"$eq":"Lớp 6"}},{"subject.subject_name_vi":{"$eq":"Toán học"}}]}
router.get("/questions/:examId", examController.getExamQuestions);
router.post("/:examId/submit", authenticateToken, examController.submitExam);
router.post("/calculate-max-scores", authenticateToken, authorizeAdmin, examController.calculateAndUpdateMaxTotalScores);

router.get("/submission/:submissionId", authenticateToken, examController.getSubmissionById);
router.get("/submission/:submissionId/detail", authenticateToken, examController.getSubmissionDetail);
router.get("/:examId/submissions", authenticateToken, examController.getUserSubmissionsByExamId);
router.get("/:examId/leaderboard", examController.getExamLeaderboard);
router.post('/generate-embeddings', authenticateToken, authorizeAdmin, examController.generateEmbeddings);
router.get("/subjects/:subjectId/submissions", authenticateToken, examController.getUserSubmissionsBySubjectId);
router.get("/subjects/total-exams", authenticateToken, examController.getTotalExamsPracticedByAllSubjects);
router.get("/subjects/average-scores", authenticateToken, examController.getAverageScoreByAllSubjects);


export default router;
