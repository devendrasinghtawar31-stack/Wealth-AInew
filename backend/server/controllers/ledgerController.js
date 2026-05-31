import Ledger from "../models/ledgerModel.js";
import User from "../models/UserModel.js";
import ErrorResponse from "../../utils/errorResponse.js";
import logger from "../config/logger.js";

// 🚀 FIXED SIGNATURE: Parameters ka order aur naam ekdum perfect match kar diya hai
const processTransactionAndAudit = async (userId, amount, type, source, description, currentWalletCoins, accountStatus, session = null) => {
    console.log(`\n=== [Audit Engine] starting transaction for User:${userId} === .cyan`);

    // Status verification (Dono string case check kiye)
    if (accountStatus === "Frozen" || accountStatus === "frozen" || accountStatus === "FROZEN") {
        throw new ErrorResponse("Transaction Denied! Your wallet is FROZEN due to security audit failure.", 403);
    }
  
    // 🎯 FIX 1: 'user.walletCoins' ki jagah upar se aa raha parameter 'currentWalletCoins' bitha diya
    let newBalance = currentWalletCoins || 0;

    // Debit or credit ka math calculate 
    if (type === "CREDIT") {
        newBalance += amount;
    } else if (type === "DEBIT") {
        if (newBalance < amount) {
            throw new ErrorResponse("insufficient funds in wallet bhai!", 400);
        }
        newBalance -= amount;
    }

    // Ledger entry create - Immutable record
    const ledgerEntryArray = await Ledger.create(
        [{
            userId,
            amount,
            type,
            source,
            description,
            runningBalanceAfter: newBalance
        }],
        { session }
    );

    const ledgerEntry = ledgerEntryArray[0];
    console.log(`[Ledger Created] ID : ${ledgerEntry._id}`.green);

    // Atomic Update without document conflict
    await User.updateOne(
        { _id: userId },
        { $set: { walletCoins: newBalance } },
        { session }
    );
    console.log(`[wallet updated] new balance:${newBalance} Coins`.yellow);

    console.log(`[Audit Pipeline] running deep system verification...`.white);

    // 🎯 FIX 2: 'ledgerEntry.user.id' ko badal kar ekdum sateek 'ledgerEntry.userId' kar diya hai
    // Sath hi '.session(session)' jod diya hai taaki taaza transaction transaction-bubble ke andar check ho sake
    const auditResult = await Ledger.aggregate([
        { $match: { userId: ledgerEntry.userId } }, 
        {
            $group: {
                _id: "$userId",
                totalCredit: {
                    $sum: { $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0] }
                },
                totalDebit: {
                    $sum: { $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0] }
                }
            }
        }
    ]).session(session);

    if (auditResult.length > 0) { 
        const { totalCredit, totalDebit } = auditResult[0];
        const calculatedBalanace = totalCredit - totalDebit;

        console.log(`Audit Status -> Total Credit: ${totalCredit} | Total Debit : ${totalDebit}`.grey);
        console.log(`Audit Check -> DB Balance: ${newBalance} | Calculated : ${calculatedBalanace}`.grey);

        // Critical security check
        if (calculatedBalanace !== newBalance) { 
            logger.error(`🚨 [SECURITY BREACH] Tampering detected for User: ${userId}. DB Balance: ${newBalance} | Calculated: ${calculatedBalanace}`);
            // console.log(`[audit failure detected] security breach !`.bgRed.white);
            
            await User.updateOne(
                { _id: userId },
                { $set: { accountStatus: "FROZEN" } },
                { session }
            );

            console.log(`🔒 [SECURITY ACTION] User Account ${userId} has been instantly FROZEN!`.bgRed.white);
            throw new ErrorResponse("🚨 Security Breach! Database tampering detected. Wallet Frozen.", 451);
        }
    }

    console.log(`✅ [Audit Passed] Wallet Balance Integrity is 100% Secure.`.bgGreen.black);
    
    return {
        success: true,
        currentBalance: newBalance,
        ledgerData: ledgerEntry
    };
};

export default processTransactionAndAudit;