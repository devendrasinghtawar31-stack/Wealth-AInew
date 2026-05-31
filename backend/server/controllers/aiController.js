import Transaction from "../models/transactionModel.js";
import Goal from "../models/goalModel.js";
import User from "../models/userModel.js";
import ai from "../config/gemini.js";
import asyncHandler from "express-async-handler";
import ErrorResponse from "../../utils/errorResponse.js";

const getFinancialAdvice = asyncHandler(async (req, res, next) => { 
    const userId = req.user._id || req.user.id;
    const userPrompt = req.query.prompt || req.body.prompt || ""; 

    console.log("🚀 [AI DEBUG] Incoming prompt node:", userPrompt);
    console.log("👤 [AI DEBUG] User authenticated ID:", userId);

    // ⚡ DATABASE FETCH PIPELINE WITH CRASH GUARDS
    let transactions = [];
    let goals = [];
    let userData = null;

    try {
        const [txData, goalsData, uData] = await Promise.all([
            Transaction.find({ user: userId }).sort({ date: -1 }).lean(),
            Goal.find({ user: userId }).lean(),
            User.findById(userId).lean()
        ]);
        transactions = txData || [];
        goals = goalsData || [];
        userData = uData;
        console.log(`📊 [AI DEBUG] DB Sync Complete. Tx Count: ${transactions.length}, Goals Count: ${goals.length}`);
    } catch (dbErr) {
        console.error("❌ [AI CRITICAL] Database Extraction Fail:", dbErr);
        return res.status(500).json({ success: false, reply: "Bhai, database se data uthane me pipe failure ho gaya hai." });
    }

    // 📊 TRANSACTIONS AGGREGATION MATRIX
    let totalIncome = 0;
    let totalExpense = 0;
    let historySummary = "No transaction log present.";

    if (transactions.length > 0) {
        historySummary = transactions.map(t => {
            const rawAmount = t.amount !== undefined ? t.amount : (t._doc && t._doc.amount !== undefined ? t._doc.amount : 0);
            const currentAmount = Number(rawAmount) || 0;

            if (t.type === 'income') totalIncome += currentAmount;
            if (t.type === 'expense') totalExpense += currentAmount;

            const txDate = t.date ? new Date(t.date).toISOString().split('T')[0] : 'No Date';
            return `${txDate} | ₹${currentAmount} | ${t.category} | ${t.type.toUpperCase()} | Merchant: ${t.merchant} | ${t.title}`;
        }).join("\n");
    }

    // 🎯 ACTIVE GOALS PROCESSING
    let goalsSummary = "No active financial goals found.";
    if (goals.length > 0) {
        goalsSummary = goals.map(g => `- Goal Name: ${g.goalName} | Target: ₹${g.targetAmount} | Current Saved: ₹${g.currentSaved}`).join("\n");
    }

    const cryptoWalletCoins = userData?.walletCoins || 0;

    // 🧠 THE RIGID SYSTEM PROMPT CONTEXT
    const systemPrompt = `
    You are "Wealth AI", a crisp, brutally honest Indian personal finance coach.
    Analyze the user's financial log and answer their prompt.
    
    CRITICAL RULES:
    1. Keep response short, powerful, under 150 words. Use emojis.
    2. Use Hinglish brother tone.
    3. Treat 'Other' or 'Unknown' categories as regular expenses.

    🔥 ADVANCED ACTION ENGINE RULES:
    - If user wants to add/save/credit money, append exactly this tag at the very end: [ACTION:UPDATE_GOAL|name:GOAL_NAME|operator:+|amount:NUMBER]
    - If user wants to remove/subtract/spend/debit money, append exactly this tag at the very end: [ACTION:UPDATE_GOAL|name:GOAL_NAME|operator:-|amount:NUMBER]
    - Replace GOAL_NAME with the exact match from the list below, and NUMBER with the amount.
    - DO NOT invent goal names.

    DATA NODES:
    - Net Balance Left: ₹${totalIncome - totalExpense}
    - Total Income: ₹${totalIncome} | Total Expenses: ₹${totalExpense}
    - Active Goals:
    ${goalsSummary}
    - Wallet Coins: ${cryptoWalletCoins}

    Log:
    ${historySummary}

    USER QUESTION: "${userPrompt}"
    `;

    try {
        console.log("🔮 [AI DEBUG] Dispatching payload to Gemini API model pipeline...");
        
        // 🚨 CONFIG SYNC CHECK: Agar ai.models.generateContent kaam nahi kar raha, toh standard syntax use karo:
        // const response = await ai.generateContent(systemPrompt); 
        // Ya fir jo tumhara default configuration framework hai usko point karo:
        
        const response = await ai.models.generateContent({
            model: 'models/gemini-2.5-flash',
            contents: systemPrompt,
        });

        console.log("✅ [AI DEBUG] Gemini response streaming clear!");

        return res.status(200).json({
            success: true,
            totalTransactionsAnalyzed: transactions.length,
            totalIncomeCalculated: totalIncome,
            totalExpenseCalculated: totalExpense,
            reply: response.text || "Bhai, processing grid empty hai."
        });

    } catch (apiErr) {
        console.error("❌ [AI CRITICAL] Gemini API Call Crashed:", apiErr);
        return res.status(500).json({ 
            success: false, 
            reply: "Bhai, Gemini API processing engine daddak gaya hai. Apne config/gemini.js ka syntax validation check karo." 
        });
    }
});

const aiController = { getFinancialAdvice };
export default aiController;