import express from "express"
import cryptoController from "../controllers/cryptoController.js"
import protect from "../middleware/authMiddleware.js"
import checkIdempotency from "../middleware/idempotencyMiddleware.js"

const router = express.Router()

router.post('/buy', protect, checkIdempotency(15), cryptoController.buyCrypto) 

router.post('/sell', protect, checkIdempotency(15), cryptoController.sellCrypto)

router.post('/redeem-subscription', protect, checkIdempotency(15), cryptoController.redeemSubscription)

// Ekdam clean line, koi comment nahi upar!
router.post('/spin', protect, checkIdempotency(15), cryptoController.spinTheWheel);

router.get('/portfolio', protect, cryptoController.getUserPorfolio);

router.get('/history', protect, cryptoController.getTransactionHistory);

export default router