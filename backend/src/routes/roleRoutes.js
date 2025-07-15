import express from "express";
import * as roleController from "../controllers/roleController.js";
const { authenticateToken, authorizeAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

// Bảo vệ các API bằng token & chỉ Admin mới truy cập được
router.get("/", roleController.getAllRoles);
router.get("/:id", roleController.getRoleById);
router.post("/", authenticateToken, authorizeAdmin, roleController.createRole);
router.put("/:id", authenticateToken, authorizeAdmin, roleController.updateRole);
router.delete("/:id", authenticateToken, authorizeAdmin, roleController.deleteRole);

export default router;
