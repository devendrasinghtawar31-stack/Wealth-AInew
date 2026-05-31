import Goal from "../models/goalModel.js";
import Transaction from "../models/transactionModel.js";
import asyncHandler from "express-async-handler";
import ErrorResponse from "../../utils/errorResponse.js";
import mongoose from "mongoose";


const createGoal = asyncHandler(async (req, res, next) => {
    const { goalName, targetAmount, targetDate } = req.body;
    const userId = req.user.id || req.user._id

    if (!goalName || !targetAmount) {
        return next(new ErrorResponse("Goal ka naam or target amount likhna zarrori hai"))

    }

    const newGoal = await Goal.create({
        user: userId,
        goalName,
        targetAmount: Number(targetAmount),
        targetDate
        
    });

    res.status(201).json({
        success: true,
        message: "congo !new financial goal has been set",
        data: newGoal
    });
});

const updateGoalProgress = asyncHandler(async (req, res, next) => { 
    const goalId = req.params.id;
    const { currentSaved } = req.body;
    const userId = req.user.id || req.user._id;

    if (currentSaved === undefined) { 
        return next (new ErrorResponse("saved money kitna hai batao "))
    }

    const goal = await Goal.findOne({ _id: goalId, user: userId });

    if (!goal) { 
        return next(new ErrorResponse("bhai ye goal nahi kila aap iske owner nahi ho"))
        
    }

    goal.currentSaved = Number(currentSaved);

    if (!goal.currentSaved >= goal.targetAmount) {
        goal.status = 'achieved';
    } else { 
        goal.status = 'active';
    }

    const updatedGoal = await goal.save();

    res.status(200).json({
        success: true,
        message: goal.status === 'achieved'
            ? "goal achieved partyy!"
            : "bachat successfully update ho gai hai",
        data:updatedGoal
    })

})


const getAllGoals = asyncHandler(async (req, res, next) => { 
    const userId = req.user.id || req.user._id;

    const goals = await Goal.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: goals.length,
        data: goals
    });
})

const deleteGoal = asyncHandler(async (req, res, next) => {
    const goalId = req.params.id;
    const userId = req.user.id || req.user._id;

    // Pehle check karo ki goal exist karta hai aur use karne wala uska owner hai ya nahi
    const goal = await Goal.findOne({ _id: goalId, user: userId });

    if (!goal) {
        return next(new ErrorResponse("Bhai, ye goal nahi mila ya aap iske owner nahi ho"));
    }

    await Goal.deleteOne({ _id: goalId });

    res.status(200).json({
        success: true,
        message: "Goal successfully uda diya gaya hai! 🗑️"
    });
});

const goalController = {
    createGoal,
    updateGoalProgress,
    getAllGoals,
    deleteGoal
}

export default goalController;