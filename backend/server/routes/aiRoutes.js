import express from "express";
import aiController from "../controllers/aiController.js";
import protect from "../middleware/authMiddleware.js";
import userController from "../controllers/UserController.js";


const router = express.Router();

router.post('/advice', protect, aiController.getFinancialAdvice)

export default router;
