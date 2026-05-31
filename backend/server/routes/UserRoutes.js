import express, { Router } from "express";
import userController from "../controllers/UserController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();


//  PUBLIC ROUTES PIPELINE
router.post('/send-otp', userController.sendOTP);         // Register ke liye OTP maangna
router.post('/forgotpassword', userController.forgotPassword); // Forgot pwd ke liye OTP maangna
router.post('/verify-otp', userController.verifyOTP);       //  Universal OTP Verification Terminal (Yeh handle karega register aur reset dono!)
router.post('/login', userController.loginUser);
router.post('/refresh-token', userController.refreshAccessToken);

//private routes
router.get('/profile', protect, userController.getUserProfile);
router.put('/update', protect, userController.updateUserProfile);
router.put('/select-banks', protect, userController.updateSelectBanks)


export default router