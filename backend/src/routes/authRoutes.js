const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, authorizeAdmin } = require("../middlewares/authMiddleware");


// Route đăng ký
router.post('/register', authController.register);
router.post('/login', authController.loginUser);
router.post("/logout", authenticateToken, authController.logout);
router.get("/validate-token", authController.validateToken);

module.exports = router;
