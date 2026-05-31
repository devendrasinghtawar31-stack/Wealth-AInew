import express from 'express'
import paymentController from "../controllers/paymentController.js"
import protect from "../middleware/authMiddleware.js"
import rateLimiter from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/create-order', protect, rateLimiter.orderLimiter, paymentController.createSubscriptionOrder)
router.post('/verify-payment', protect, paymentController.verifyPayment)

router.post('/webhook' , paymentController.handleRazorpayWebhook)


export default router