import mongoose from "mongoose";
import User from "../models/UserModel.js";
import VirtualPortfolio from "../models/virtualPortfolioModel.js";
import CoinTransaction from "../models/coinTransactionModel.js";
import ErrorResponse from "../../utils/errorResponse.js";
import asyncHandler from "express-async-handler";
import axios from "axios";
import db from "../config/db.js";
const {redisClient } = db
import { json } from "express";
import processTransactionAndAudit from "./ledgerController.js";


//simulated live rates
//(avbhi k lie fixed baad me live api se jod denge)

//  BACKGROUND CRON / INTERVAL FUNCTION: Live Crypto Rates Fetcher
 const fetchAndCacheCryptoPrices = async () => {
    try {
        console.log(" [Redis Cache] CoinGecko se live rates fetch ho rahe hain...".cyan);

        // 1. CoinGecko API ko hit maaro (BTC, ETH, SOL ka rate INR aur USD dono me)
        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=inr,usd"
        );
        
        const data = await response.json();

        // 2. Agar API se sahi data mila hai, toh use Redis me stringify karke patak do
        if (data && data.bitcoin) {
            // Redis me data save karne ke liye client.set() ka use hota hai
            // Hum isey 'crypto:prices' naam ki Chabi (Key) me save kar rahe hain
            await redisClient.set("crypto:prices", JSON.stringify(data));
            
            console.log(" [Redis Cache] Rates RAM me successfully save ho gaye, PONG!".bgGreen.black);
        }
    } catch (error) {
        console.error("[Redis Cache Error] Background price fetch fail ho gaya bhai:", error.message);
    }
};

const getCryptoLiveRateInCoins = async (cryptoName) => {

    try {

        //coingecko ki free api se limited crypto ka price INR me laenge
        //im mapping: bt->bitcoin etc

        const cryptoIds = {
            BTC: "bitcoin",
            ETH: "ethereum",
            SOL: "solana",
        };
        const id = cryptoIds[cryptoName.toUpperCase()];
        if (!id) return null; //agar koi crypto mangi jolist me nahi hai


        //pehle redis ram ke andr check
        //Humne db.js se default import kiya hai, isliye db.redisClient use karenge
        const cachedPrices = await db.redisClient.get("crypto:prices");

        if (cachedPrices) { 
            //redis se jo mila wo string thi , use wapas json object 
            const pricesObj = JSON.parse(cachedPrices);
            const priceInINR = pricesObj[id]?.inr;

            if (priceInINR) { 
                console.log(`[redis hit] ${cryptoName} ka rate RAM se mil gaya`.green)
                return priceInINR;
            }
        }

        //step 2 agar kisi wjhs se reddis khali hai to direct api hit karo
        console.log(`[redis miss] cahce me rate nahi mile ,coingecko api hit ho rahi hai`.yellow)
        //live api call to coingecko
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=inr`
        );

        // CoinGecko ka response format aisa hota hai: { bitcoin: { inr: 5400000 } }
        const priceInINR = response.data[id]?.inr;
        return priceInINR || null;

        
    } catch (error) {
        
        console.error(`coingecko api feth failed: ${error.message}`);
        // Fallback: Agar API gusse me block kar de ya down ho, toh server crash na ho,
        // ek safe default backup rate return kar do temporary.
        
        const backupRates = { BTC: 5400000, ETH: 300000, SOL: 12000 };
        return backupRates[cryptoName.toUpperCase()] || null;
    }
};



const buyCrypto = asyncHandler(async (req, res, next) => { 
    const { cryptoName, coinsToInvest } = req.body; 
    const userId = req.user?._id || req.user.id;

    if (!cryptoName || !coinsToInvest || coinsToInvest <= 0) { 
        return next(new ErrorResponse("bhai sahi crypto name or valid coins dalo!", 400));
    }

    //live rate check karo
    const currentRate = await getCryptoLiveRateInCoins(cryptoName);

    if (!currentRate) { 
        return next (new ErrorResponse("bhai,ye crypto hamare market me available nahi hai",400))
    }

    //ACID session chalu kara
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        //user check karo aur wallet balance dekho

        const user = await User.findById(userId).session(session);
        if (user.walletCoins < coinsToInvest) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorResponse("Bhai,aapke wallet me itne coins nahi hai ", 400))
        }

        //quantity check karo (kitna crypto milega)
        const quantityToBuy = coinsToInvest / currentRate;

        //user ke wallet me coins minus karo
        user.walletCoins -= coinsToInvest;
        await user.save({ session });

        //virtual portfolio
        let portfolioItem = await VirtualPortfolio.findOne({ user: userId, cryptoName: cryptoName.toUpperCase() }).session(session);

        if (portfolioItem) {
            //agar pehle se kharid rakha hai , to nata averegae price aur quantity nikalana padega (pro maths)


                           //isme pehle se jo quantity hai vo  * jab kitnr ka kharida tha uske baad + aaj kitne ka kaharidna hai .=totalcost
            const totalCost = (portfolioItem.quantity * portfolioItem.avgBuyPrice) + coinsToInvest;

            //ab total kitne honge pehle manlo 2 the or abhi 1 lena hai to =3
            portfolioItem.quantity += quantityToBuy;

            //ab avrage price ke lie totalpaise ko divide kia total quantity se 
            portfolioItem.avgBuyPrice = totalCost / portfolioItem.quantity; //new weighted average price

            await portfolioItem.save({ session });
        } else { 
            //agar pehli baar khareed raha hai toh naya banao
            portfolioItem = await VirtualPortfolio.create([{
                user: userId,
                cryptoName: cryptoName.toUpperCase(),
                quantity: quantityToBuy,
                avgBuyPrice: currentRate
            }], { session });
            portfolioItem = portfolioItem[0];//mongoose aary return karta hai create me sesion ke sath
        }

        //coin History ledger me entry karo
        const coinTx = await CoinTransaction.create([{
            user: userId,
            type: 'BUY',
            cryptoName: cryptoName.toUpperCase(),
            coinsInvolved: Number(coinsToInvest)
        }], { session });

        //sab sahi raha toh commit kar do tijori
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: `${cryptoName} successfully khareed lia gaya`,
            walletBalanceLeft: user.walletCoins,
            liveRateApplied: currentRate,
            portfolio: portfolioItem,
            transaction: coinTx[0]
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return next(new ErrorResponse(`buy operation failed:${ error.message}`, 500))
        
     }
})


const sellCrypto = asyncHandler(async (req, res, next) => { 
    const { cryptoName, quantityToSell } = req.body;
    const userId = req.user?._id || req.userId;

    if (!cryptoName || !quantityToSell || quantityToSell <= 0) { 
        return next(new ErrorResponse("bhai, sahi crypto name or valid quantity daalo",400))
    }

       //string koi nymber me change kia calculations sahi rahe islie
    const sellQty = Number(quantityToSell);

    //live rate check karenge
    const currentRate =  await getCryptoLiveRateInCoins(cryptoName);
    if (!currentRate) { 
        return next(new ErrorResponse("bhai,ye crypto hamare market me available nahi hai ",400))
    }
    

    //ACID session start
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        //check karenge user k portfolio me ye crypto hai ya nahi
        const portfolioItem = await VirtualPortfolio.findOne({
            user: userId,
            cryptoName: cryptoName.toUpperCase()
        }).session(session);

        if (!portfolioItem) { 
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorResponse(`Bhai, aapke ${cryptoName} ka koi portfolio nahi jai`))
        }


        //strict number comparison
        if (Number(portfolioItem.quantity) < sellQty) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorResponse(`bhai ,jitna maal hai usse jyada nahi bech sakte,Aapke paas kul ${portfolioItem.quantity} quantity hi mojud hai.`, 400 ))
        }

        //asli maths : kitne coins wapas milenge(quantity*currentrate)
        const coinsReceived = sellQty * currentRate;

        //user ke wallet me paise /coins plus karo
        const user = await User.findById(userId).session(session);
        user.walletCoins += coinsReceived;
        await user.save({ session });

        //portfolio update

        portfolioItem.quantity -= sellQty;

        if (portfolioItem.quantity <= 0) {
            //agar sab kuch bech dia to row mita do
            await VirtualPortfolio.deleteOne({ _id: portfolioItem._id }).session(session);
        } else { 
            //agar kuch quantity bach jati hai to (avg price hai same rahega sell karte time bhi)
            await portfolioItem.save({ session });
        }

        //coin history update entry

        const coinTx = await CoinTransaction.create([{
            user: userId,
            type: 'SELL',
            cryptoName: cryptoName.toUpperCase(),
            coinsInvolved:Number(coinsReceived)
        }], { session })
        
        //ab sab kuch sahi hua to commit kardo
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: `${cryptoName} successfully bech dia gaya`,
            walletBalanceNow: user.walletCoins,
            liveRateApplied: currentRate,
            coinsReceivedFromSale: coinsReceived,
            portfolioStatus: portfolioItem.quantity === 0 ? "Empty / Deleted" : portfolioItem,
            transaction: coinTx[0] 

        });
        
    } catch (error) {

        await session.abortTransaction();
        session.endSession();
        return next(new ErrorResponse(`sell operation failed: ${error.message}`,500))
        
    }
})


const redeemSubscription = asyncHandler(async (req, res, next) => { 
    const userId = req.user?._id || req.user.id;
    const COINS_NEEDED = 10000;


    const preCheckUser = await User.findById(userId);
    if (!preCheckUser || preCheckUser.walletCoins < COINS_NEEDED) { 
        return next (new ErrorResponse('bhai 10000 coins chahiyee tumahre pass nahi hai,tumhare pass abhi ${preCheckUser?.walletCoins || 0} coins hai', 400))
    } 

    //ACID session  start kia

    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
            //user check and wallet balance check
        const user = await User.findById(userId).session(session);

        //double check of user and coin availability
        if (user.walletCoins < COINS_NEEDED) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorResponse(`Bhai, free subscription ke lie ${COINS_NEEDED} coins chahiye ,tumhare pass abhi ${user.walletCoins}coins hai`,400))
        }
        
        //User ke wallet se 10000 coins minus karo
        user.walletCoins -= COINS_NEEDED;

        //asli khel:premium expiry date calculatio (30 din extension)

        const DAYS_TO_ADD = 30;
        let currentExpiry = user.premiumExpiresAt;
        let newExpiryDate = new Date();

        //agar user pehle se premium hai aur uski expiry date future ki hai 
        if (user.isPremium && currentExpiry && new Date(currentExpiry) > new Date()) {
            newExpiryDate = new Date(currentExpiry); //purani expiry se shuru karo
        } else { 
            newExpiryDate = new Date(); //aaj ki date se shuru karo
        }

        //expiry date me +30 jodh do
        newExpiryDate.setDate(newExpiryDate.getDate() + DAYS_TO_ADD);

        //user ka status update karo
        user.isPremium = true;
        user.subscriptionStatus = 'active';
        user.premiumExpiresAt = newExpiryDate;

        await user.save({ session });

        const coinTx = await CoinTransaction.create([{
            user: userId,
            type: 'SUB_REDEEM',
            coinsInvolved: COINS_NEEDED
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: "mubarak ho bhai 1 mahine ka subcription successfully mila",
            walletBalanceNow: user.walletCoins,
            premiumExpiresAt: user.premiumExpiresAt,
            transaction: coinTx[0]
        });

    
        
    } catch (error) {
        if (session.inTransaction()) { 
            await session.abortTransaction();
        }
        session.endSession();
        return next(new ErrorResponse(`redemption failed : ${error.message}`, 500))
    }
})

//retry + mongoose session +reddis 1st
// const spinTheWheel = asyncHandler(async (req, res, next) => {
//     const userId = req.user?._id || req.user.id;

//     //user ka data freshly fetch karo
//     const user = await User.findById(userId);
//     if (!user) {
//         return next(new ErrorResponse("bhai,user nahi mila", 400));
//     }

//     const now = new Date();
//     const lastSpun = user.spinReward?.lastSpunAt;

//     //strict 24 hour check guard
//     if (lastSpun) {
//         const timeDifferenceInMs = now - new Date(lastSpun);
//         const hoursPassed = timeDifferenceInMs / (1000 * 60 * 60); //milliseconds ko hours me badla

//         if (hoursPassed < 24) {
//             const hoursLeft = Math.ceil(24 - hoursPassed);
//             return next(new ErrorResponse(`bhai thoda sabar karo agla spin hai vo ${hoursLeft} ghante baad milega`, 400))
//         }
//     }

//     //random reward matrix kismat ka khel
//     const rewardsArray = [10, 20, 30, 40, 100, 250, 500];
//     const randomIndex = Math.floor(Math.random() * rewardsArray.length);
//     const coinsWon = rewardsArray[randomIndex];


//     //ACID SESSION (wallet update + passbook entry)
//     //and new updated retry system for write conflicts max 3 tries
//     let maxRetries = 3;
//     while (maxRetries > 0) {

//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         //session keandr user ko refresh karo aur data update karo
//         const sessionUser = await User.findById(userId).session(session);

//         sessionUser.walletCoins = (sessionUser.walletCoins || 0) + coinsWon;
//         sessionUser.spinReward.lastSpunAt = now; //abhi ka time stamp lock karo
//         sessionUser.spinReward.spinStreak += 1;

//         await sessionUser.save({ session });

//         //coin history me permanent record dalo

//         const coinTx = await CoinTransaction.create([{
//             user: userId,
//             type: 'REWARD',
//             coinsInvolved: coinsWon
//         }], { session });

//         await session.commitTransaction();
//         session.endSession();

//         res.status(200).json({
//             success: true,
//             message: `kya kisamt hai bhai wheel ghumane par tumhe ${coinsWon} mile`,
//             coinsWon: coinsWon,
//             walletBalanceNow: sessionUser.walletCoins,
//             nextSpinAfter: new Date(now.getTime() + 24 * 60 * 60 * 1000),//agle 3]24 ghnate ke lie
//             transaction: coinTx[0]
//         });
//     } catch (error) {
//         await session.abortTransaction();
//         session.endSession();

//         //check if it is a wrie conflict
//         const isWriteConflict = error.mesage.includes("write conflict") || error.code === 112;

//         if (isWriteConflict) {
//             maxRetries--; //ek try kam karo
//             console.log(`write conflict hua! auto retrying... remaining attempts:${maxRetries}`)

//             //chota sa break(50ms) taki dusra transaction khatam ho sake
//             await new Promise(resolve => setTimeout(resolve, 50));
//             continue; //loop ko dobara chalao
//         }
//         return next(new ErrorResponse(`spin operation failed :${error.message}`, 500))

//     }

//     }
//     //agar 3 baar retry karne ke baad bhi fail ho jae
//     return next (new ErrorResponse("Bhai, server par load zyada hai , ke baar aur button dabao",500))

// })

//atomic approach (write conflict aaya tha islie )

const spinTheWheel = asyncHandler(async (req, res, next) => {
    const userId = req.user._id || req.userId;
    const now = new Date();

    // 1. Time window constraint setup (Strict 24 Hours Filter Window)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 2. Upgraded High Value Reward Matrix
    const rewardsArray = [100, 200, 500, 1000, 2500, 5000];
    const randomIndex = Math.floor(Math.random() * rewardsArray.length);
    const coinsWon = rewardsArray[randomIndex];

    console.log(`🎰 SPIN ATTEMPT: User ${userId} is spinning for ${coinsWon} coins.`);

    // 🎯 STRICT ATOMIC FILTER: MongoDB provides isolated field safety on single documents by default
    const filter = {
        _id: userId,
        $or: [
            { "spinReward.lastSpunAt": null },
            { "spinReward.lastSpunAt": { $lt: twentyFourHoursAgo } }
        ]
    };

    // 👑 ATOMIC UPDATE OPERATION: Direct pipeline updates wallet and updates timestamps safely
    const update = {
        $inc: { "spinReward.spinStreak": 1, }, 
        $set: { "spinReward.lastSpunAt": now } 
    };

    // Single sweep update trigger
    const updatedUserObj = await User.findOneAndUpdate(filter, update, { 
        returnDocument: 'after',
        runValidators: true
    });

    // 🚨 TIME LOCK DETECTED: User attempts duplicate click or 24hr window is active
    if (!updatedUserObj) { 
        const user = await User.findById(userId);
        const lastSpunTime = user.spinReward?.lastSpunAt ? new Date(user.spinReward.lastSpunAt) : now;
        const hoursPassed = (now - lastSpunTime) / (1000 * 60 * 60);
        const hoursLeft = Math.ceil(24 - hoursPassed);

        return next(new ErrorResponse(`bhai, thoda sabar karo! agla spin ${hoursLeft > 0 ? hoursLeft : 24} ghante ke baad milega.`, 400));
    }

    console.log("🟢 SUCCESS: Database successfully updated and locked permanently!", updatedUserObj.spinReward);

    // 🔥 BACKGROUND AUDIT/LEDGER LOG: (Optional history tracker execution)
    try {
        if (typeof processTransactionAndAudit === "function") {
          const auditResult = await processTransactionAndAudit(
                userId, 
                coinsWon, 
                "CREDIT", 
                "DAILY_SPIN",
                `🎉 Daily Spin Wheel Reward: Received ${coinsWon} coins`,
                updatedUserObj.walletCoins, 
                updatedUserObj.accountStatus
            );
         // Ledger se aaya hua absolute fresh balance uthao
            if (auditResult && auditResult.currentBalance) {
                finalBalanceNow = auditResult.currentBalance;
            }   
        }
    } catch (auditErr) {
        console.error("Non-blocking audit ledger logging bypassed:", auditErr.message);
    }

    // 3. Clean Senior-Grade Response Schema
    return res.status(200).json({
        success: true,
        message: `🎉 Aapko ${coinsWon} muft coins mile hain!`,
        coinsWon: coinsWon,
        walletBalanceNow: updatedUserObj.walletCoins, // 🚀 Direct actual updated balance pass to frontend
        nextSpinAfter: new Date(now.getTime() + 24 * 60 * 60 * 1000).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    });
});

const getUserPorfolio = asyncHandler(async (req, res, next) => { 


    const userId = req.user?._id || req.user.id

    //user aur uske saaare potfolio items ko fetch karna

    const user = await User.findById(userId);
    if (!user) { 
        return next(new ErrorResponse("bhai,user nahi mila", 400));
    }

    const portfolioItems = await VirtualPortfolio.find({ user: userId });

    let totalPortfolioInvestment = 0;
    let totalPortfolioCurrentValue = 0;
    let calculatedPortfolio = [];

    //loop chala kar har ek crypto ka live status nikalo

    for (const item of portfolioItems) { 
        //taza live rate mangao
        const currentRate = await getCryptoLiveRateInCoins(item.cryptoName);

        //sateek maths calcultions
        const totalInvestment = item.quantity * item.avgBuyPrice;
        const currentTotalValue = item.quantity * (currentRate || item.avgBuyPrice); //fallback to avg if api fails

        const profitOrLossCoins = currentTotalValue - totalInvestment;

        //divide by zero error se bachne ke lie check
        const profitOrLossPercentage = totalInvestment > 0
            ? (profitOrLossCoins / totalInvestment) * 100
            : 0;
        
        //total counters me jodh te chalo (poore portfolio ka calculation)
        totalPortfolioInvestment += totalInvestment;
        totalPortfolioCurrentValue += currentTotalValue;

        //frontend ke lie mast individual item object banao

        calculatedPortfolio.push({
            _id: item._id,
            cryptoName: item.cryptoName,
            quantity: item.quantity,
            avgBuyPrice: item.avgBuyPrice,
            totalInvestment: Number(totalInvestment.toFixed(2)),
            currentLiveRate: currentRate,
            currentTotalValue: Number(currentTotalValue.toFixed(2)),
            profitOrLossCoins: Number(profitOrLossCoins.toFixed(2)),
            profitOrLossPercentage: Number(profitOrLossPercentage.toFixed(2)),
            status: profitOrLossCoins >= 0 ? "PROFIT" : "LOSS"
        });
    };

    //overall portfolio ka p&l
    const overallProfitOrLossCoins = totalPortfolioCurrentValue - totalPortfolioInvestment;
    const overallProfitOrLossPercentage = totalPortfolioInvestment > 0
        ? (overallProfitOrLossCoins / totalPortfolioInvestment) * 100
        : 0;
    
    //net worth = wallet me pada cash + cryptos ki aaj ki live value
    const totalNetWorth = (user.walletCoins || 0) + totalPortfolioCurrentValue;

    //response

    res.status(200).json({
        success: true,
        summary: {
            walletBalance: user.walletCoins,
            totalNetWorth: Number(totalNetWorth.toFixed(2)),
            totalPortfolioInvestment: Number(totalPortfolioInvestment.toFixed(2)),
            totalPortfolioCurrentValue: Number(totalPortfolioCurrentValue.toFixed(2)),
            overallProfitOrLossCoins: Number(overallProfitOrLossCoins.toFixed(2)),
            overallProfitOrLossPercentage: Number(overallProfitOrLossPercentage.toFixed(2)),
            portfolioStatus: overallProfitOrLossCoins >= 0 ? "PROFIT" : "LOSS"
        },
        portfolio: calculatedPortfolio
    });

})

const getTransactionHistory = asyncHandler(async (req, res, next) => { 

    const userId = req.user?._id || req.userId;

    //data base se user ke saare transactions uthao
    //.sort ({created :-1 }) ka mtlb hai: sabse naya transaction sabse pehle
    
    const history = await CoinTransaction.find({ user: userId })
        .sort({ createdAt: -1 });
    
    res.status(200).json({
        success: true,
        count: history.length,
        history: history
    })
})


const cryptoController = { buyCrypto , sellCrypto , redeemSubscription, spinTheWheel, getUserPorfolio , getTransactionHistory , fetchAndCacheCryptoPrices ,getCryptoLiveRateInCoins }

export default cryptoController