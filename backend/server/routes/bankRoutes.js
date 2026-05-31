import express from "express";
import bankController from "../controllers/bankController.js"; // 🚀 Default import uthayein
import  protect from "../middleware/authMiddleware.js"; // Ek baar check kar lena path custom token middleware ka

const router = express.Router();

// 🚀 FIXED: bankController object ke andar se functions ko strictly target kiya hai
router.get("/", protect, bankController.getAvailableBanks);
router.post("/sync", protect, bankController.syncUserBanks);

export default router;