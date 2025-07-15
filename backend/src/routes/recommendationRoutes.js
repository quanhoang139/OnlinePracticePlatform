import express from "express";
import * as recommendationController from "../controllers/recommendationController.js";
const { authenticateToken, authorizeAdmin } = require("../middlewares/authMiddleware");


const router = express.Router();

router.post('/generate-embeddings', authenticateToken, authorizeAdmin, recommendationController.generateEmbeddings);
router.get('/', recommendationController.getRecommendations);
router.post("/feedback", authenticateToken, recommendationController.submitFeedback);

export default router;