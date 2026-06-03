import asyncHandler from "express-async-handler";
import ErrorResponse from "../../utils/errorResponse.js";
import mongoose from "mongoose";

// @desc    Get all supported Indian banks (Exhaustive Enterprise Dataset)
// @route   GET /api/banks
// @access  Private
const getAvailableBanks = asyncHandler(async (req, res, next) => {
    try {
        /* 
        // 🌐 PRESERVED RAZORPAY LIVE INTEGRATION NODE (For future production flip flag)
        const response = await fetch('https://api.razorpay.com/v1/methods?currency=INR', {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
                'Accept': 'application/json'
            }
        });
        if (!response.ok) throw new Error(`Razorpay rejected query`);
        const data = await response.json();
        // Mapping conversion logic goes here...
        */

        // 🚀 ENTERPRISE MASTER MATRIX: Highly optimized mapping array for instant execution
        const allIndianBanks = [
            { id: 'SBIN', name: 'State Bank of India', logo: '🏦' },
            { id: 'HDFC', name: 'HDFC Bank', logo: '🏦' },
            { id: 'ICIC', name: 'ICICI Bank', logo: '🏦' },
            { id: 'UTIB', name: 'Axis Bank', logo: '🏦' },
            { id: 'KKBK', name: 'Kotak Mahindra Bank', logo: '🏦' },
            { id: 'BARB', name: 'Bank of Baroda', logo: '🏦' },
            { id: 'PUNB', name: 'Punjab National Bank', logo: '🏦' },
            { id: 'CNRB', name: 'Canara Bank', logo: '🏦' },
            { id: 'IBKL', name: 'IDBI Bank', logo: '🏦' },
            { id: 'IDFB', name: 'IDFC First Bank', logo: '🏦' },
            { id: 'YESB', name: 'Yes Bank', logo: '🏦' },
            { id: 'INDB', name: 'IndusInd Bank', logo: '🏦' },
            { id: 'IOBA', name: 'Indian Overseas Bank', logo: '🏦' },
            { id: 'UCBA', name: 'UCO Bank', logo: '🏦' },
            { id: 'UBIN', name: 'Union Bank of India', logo: '🏦' },
            { id: 'CBIN', name: 'Central Bank of India', logo: '🏦' },
            { id: 'MAHB', name: 'Bank of Maharashtra', logo: '🏦' },
            { id: 'PSIB', name: 'Punjab & Sind Bank', logo: '🏦' },
            { id: 'SIBL', name: 'South Indian Bank', logo: '🏦' },
            { id: 'KVBL', name: 'Karur Vysya Bank', logo: '🏦' },
            { id: 'TMBL', name: 'Tamilnad Mercantile Bank', logo: '🏦' },
            { id: 'FSFB', name: 'Fincare Small Finance Bank', logo: '🏦' },
            { id: 'AUBL', name: 'AU Small Finance Bank', logo: '🏦' },
            { id: 'ESAF', name: 'ESAF Small Finance Bank', logo: '🏦' },
            { id: 'DBSS', name: 'Deutsche Bank', logo: '🏦' },
            { id: 'HSBC', name: 'HSBC Bank', logo: '🏦' },
            { id: 'SCBL', name: 'Standard Chartered', logo: '🏦' },
            { id: 'CITI', name: 'Citi Bank', logo: '🏦' }
        ];

        // Safe console layout tracking log
        console.log(`--> Success: Served ${allIndianBanks.length} Enterprise Bank Nodes cleanly.`);

        return res.status(200).json({
            success: true,
            count: allIndianBanks.length,
            data: allIndianBanks
        });

    } catch (error) {
        return next(new ErrorResponse(`Bank loading failed: ${error.message}`, 500));
    }
});

// @desc    Sync and save user's selected bank nodes for dynamic SMS parsing map
// @route   POST /api/banks/sync
// @access  Private
const syncUserBanks = asyncHandler(async (req, res, next) => {
    const { selectedBanks } = req.body;
    const userId = req.user?._id;

    if (!selectedBanks || !Array.isArray(selectedBanks)) {
        return next(new ErrorResponse("Bhai, selectedBanks ka array bhejna zaroori hai", 400));
    }

    const isPremium = req.user?.isPremium || false;
    if (!isPremium && selectedBanks.length > 2) {
        return next(new ErrorResponse("Security Block: Free tier maximum 2 banks hi connect kar sakta hai!", 403));
    }

    const UserModel = mongoose.model("User"); 

    const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { associatedBanks: selectedBanks }, // Direct synchronization mapping filter endpoint link
        { new: true, runValidators: true }
    );

    if (!updatedUser) {
        return next(new ErrorResponse("Bhai, user nahi mila!", 404));
    }
console.log("--> DB Update Success. New Banks:", updatedUser.associatedBanks);
    res.status(200).json({
        success: true,
        message: `🎉 Successfully mapped ${selectedBanks.length} bank nodes to your SMS Parsing Profile!`,
        associatedBanks: updatedUser.associatedBanks
    });
});

const bankController = { getAvailableBanks, syncUserBanks };
export default bankController;