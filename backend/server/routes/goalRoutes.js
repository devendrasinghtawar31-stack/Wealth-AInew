import express from "express";
import goalController from "../controllers/goalController.js";
import protect from "../middleware/authMiddleware.js";


const router = express.Router();

router.post('/create', protect, goalController.createGoal)
router.put('/update-progress/:id', protect, goalController.updateGoalProgress)
router.get('/all-goals', protect, goalController.getAllGoals)
router.delete('/delete/:id', protect, goalController.deleteGoal)


export default router;