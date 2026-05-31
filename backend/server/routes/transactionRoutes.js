import express from "express"
import transactionController from "../controllers/transactionControllers.js";
import protect  from "../middleware/authMiddleware.js";
import rateLimiter from "../middleware/rateLimiter.js";
import User from "../models/UserModel.js";
const router = express.Router()

//protected rahegi rotes sirf user hi kar sakta hai
router.route('/')
    .post(protect, transactionController.addTransaction)
    .get(protect, transactionController.getTransactionStats)

    //
router.post('/process-sms', protect, rateLimiter.smsLimiter, transactionController.processIncomingSms)
    
router.put('/update/:id', protect, transactionController.updateManualTransaction)

// Frontend isi route par hit maarkay puri ledger list uthaega
router.get('/all', protect, transactionController.getAllTransactions);
   

export default router;