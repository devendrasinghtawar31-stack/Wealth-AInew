import asyncHandler from "express-async-handler";
import ErrorResponse from "../../utils/errorResponse.js";
import Transaction from "../models/transactionModel.js";
import parseSMS from "../../utils/smsParser.js";
import Message from "twilio/lib/twiml/MessagingResponse.js";
import mongoose from "mongoose";


const addTransaction = asyncHandler(async (req, res, next) => {
    const { title, amount, type, category, date } = req.body

    //check karo ki data aaya ya nahi

    if (!title || !amount || !type || !category) { 

        return next (new ErrorResponse("bhai ,saari fields bharna zaroori hai",400))
    }

    const transaction = await Transaction.create({
        user: req.user._id || req.user.id,//ye humein 'protect middle ware se mil raha hai
        title,
        amount,
        type,
        category,
        date
    });

    res.status(201).json({
        success: true,
        data:transaction
    })
})



// @desc    Get user's financial stats (Total Income, Expense, Balance)
// @route   GET /api/transactions/stats
// @access  Private
const getTransactionStats = asyncHandler(async (req, res, next) => {
    // MongoDB Aggregation Pipeline - Ek advanced query jo saara hisab andar hi kar degi
    const stats = await Transaction.aggregate([
        // 1. Sirf usi user ke transactions nikalo jo logged in hai
        { $match: { user: req.user._id } },
        
        // 2. Type ke hisab se group karo ('income' alg, 'expense' alag) aur amount ko jodo
        {
            $group: {
                _id: '$type',
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        }
    ]);

    // Data ko clean karke format karo
    let income = 0;
    let expense = 0;

    stats.forEach(item => {
        if (item._id === 'income') income = item.totalAmount;
        if (item._id === 'expense') expense = item.totalAmount;
    });

    res.status(200).json({
        success: true,
        data: {
            totalIncome: income,
            totalExpense: expense,
            netBalance: income - expense, // Asli bachat
            rawStats: stats
        }
    });
});


const processIncomingSms = asyncHandler(async (req, res, next) => { 

    console.log("--> Debug Auth: User ID is", req.user?._id);
console.log("--> Debug Banks: User has banks", req.user?.associatedBanks);
  
    // frontend ab text ke sath sender id bhi bheje ga jese ki boi ki booind etc
    const { smsText, sender } = req.body;
    const user = req.user;

    console.log(`--> 1. API Hit: Sender [${sender || 'Unknown'}], Message: ${smsText}`);
    //check karo ki sms text aaya bhi ya nahi
    if (!smsText) {
        return next(new ErrorResponse("bhai ,sms text bhjna zaroori hai", 400));
    } 
    // 🔥 SENDER SECURITY FILTER (Tumhara demanded logic)
    if (sender) {
        // 1. Agar sender 10 digit ka normal number hai (pure numbers), toh block karo
        const isMobileNumber = /^\d{10}$/.test(sender.trim());
        
   //database se user ki chuni hui bank nikalna
        const userBanks = req.user?.associatedBanks || [];
        // 2. Bank ke standard keywords check karo sender string mein
        const sndr = sender ? sender.toLowerCase() : '';

        const hasBankKeyword = sndr.includes('bk') || sndr.includes('bnk');


        //dynamic loops : kya incoming sender mein user ki kisi select ki hui bank ka naam chuppa hai?\
        const matchesUserBank = userBanks.some(bank => sndr.includes(bank.toLowerCase()));

        //final desicions sms tabhi valid hau jab vo user ki kisi selected banks se or bank k formt me ho
        const isBankSender = hasBankKeyword || matchesUserBank;

        if (isMobileNumber || (!isBankSender && sender !== 'Unknown')) {
            console.log("--> Security Block: Sender ek normal number ya fraud sender hai!");
            return next(new ErrorResponse("Security Filter: Ye SMS kisi valid bank ya transactional head se nahi aaya hai.", 400));
        }
    }

     //apne util brain (parser) ko sms bhejo data nikalne ke lie
    const parsedData = parseSMS(smsText);
    if (parsedData.ignore) {
        return next(new ErrorResponse("Bhai, Ye SMS kisi valid bank ya transactional head se nahi aaya hai.", 400));
    }
    if (parsedData.amount <= 0 || parsedData.type === 'pending' || !parsedData.title) {
    console.log("--> Parsing Failed: Regex kuch nikal nahi paya", parsedData);
    return next(new ErrorResponse("Bhai, SMS se details nahi nikal paayi. Shayad format match nahi hua.", 400));
}
       
        //agar regex ko amount nahi ,milta to mtlb ye bank ka transactional sms nahi hai
        if (parsedData.amount === 0) { 
            
            return next(new ErrorResponse("yekoi normal message hai , bank ka transaction nahi hai", 400))
    }
    
    //duplictae entry rokne ke lue  idempotency guard:
    const isDuplicate = await Transaction.findOne({ smsHash: parsedData.smsHash });

    if (isDuplicate) { 
        console.log('-->duplicate blocked:sms has already been present')
        return res.status(200).json({
            success: true,
            message: "bhai ,ye transaction pehle se added hai ! Duplicate entry safely roki gai",
            duplicateDetected: true,
            currentTransaction: isDuplicate
        })
    }

        //agar sms samjh nahi aay to pending

        let verificationStatus = 'verified';
        if (parsedData.type === 'pending') { 
            verificationStatus = 'unverified' 
        }
       
    //user id nikalna (protect middleware se)
    const userId = req.user?._id

    const newTransaction = await Transaction.create({
                 user: userId,
                 sender:sender || 'Unknown',
                title: parsedData.title,
                amount: parsedData.amount,
                type: parsedData.type,
                 category: parsedData.category,
                merchant: parsedData.merchant,
                status: verificationStatus,
        rawText: smsText,
                smsHash:parsedData.smsHash
    })

    //aggregation pipeline - realtime total income,expenses,aur left money ka hisab
    
    const summary = await Transaction.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId),
                status : 'verified'
            }
        },
        {
            $group: {
                _id: null,  //: Iska matlab hai humein saare filtered transactions ko ek hi sath jodhna hai (alag-alag groups mein nahi baantna).
                totalIncome: {
                    $sum: { $cond: [{$eq: ["$type","income"]},"$amount",0]}
                },
                  totalExpense: {
                    $sum: { $cond: [{$eq: ["$type","expense"]},"$amount",0]}
                }
            }
        }
    ])

    //defaults agarr pehla transaction ho to

    const totalIncome = summary.length > 0 ? summary[0].totalIncome : 0;
    const totalExpense = summary.length > 0 ? summary[0].totalExpense : 0;
    const moneyLeft = totalIncome - totalExpense;

    //final response
    res.status(200).json({
        success: true,
        message: verificationStatus === 'unverified'
        ? "Transaction save ho gaya par user se confirm karna padega"
            : "SMS parsed and saved in database successfully!",
        summary: {
            totalIncome,
            totalExpense,
            moneyLeft,
            currency:'INR'
        },
        currentTransaction: newTransaction
        
    })    
    
})

const updateManualTransaction = asyncHandler(async(req, res, next) => { 
    const transactionId = req.params.id;
    const { amount, title, category, type, merchant } = req.body;
    const userId = req.user?._id || req.userId;


    const session = await mongoose.startSession();
    session.startTransaction();


    try {
       // Check karo ki ye transaction sach me isi user ka hai na?
        //.session(session) lagana zaroori hai taaki ye is transaction ka hissa bane
        const existingTx = await Transaction.findOne({ _id: transactionId, user: userId }).session(session);

        if (!existingTx) {
            
            //agar transaction nahi mila toh sesssion abort karo aur error phek do
            await session.abortTransaction();
            session.endSession();
           return next (new ErrorResponse("bhai ,ye transaction nahi mila ya aap iske owner nahi ho",44))
        }

        //data ko update karenge wahi badlenge jo user ne badla

        existingTx.title = title || existingTx.title;
        existingTx.amount = amount !== undefined ? Number(amount) : existingTx.amount;
        existingTx.category = category || existingTx.category;
        existingTx.type = type || existingTx.type;
        existingTx.merchant = merchant || existingTx.merchant;

        //agar user ne status updte karna chaha ho ,varna default verified
        if (type === 'pending') existingTx.status = 'unverified';
        else existingTx.status = 'verified';

        //updated document ko session ke andr save karo

        const updatedTransaction = await existingTx.save({ session });

        //aagregation pipeline (real time recalculation inside the same session)
        //hum isi running session ke andr naya total calculate karenge

        const summary = await Transaction.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                    status: 'verified'
                }
            },
            {
                $group: {
                    _id: null,
                    totalIncome: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
                        }
                    },
                    totalExpense: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0]
                        }
                    }
                }
            }
        ]).session(session);

        const totalIncome = summary.length > 0 ? summary[0].totalIncome : 0;
        const totalExpense = summary.length > 0 ? summary[0].totalExpense : 0;
        const moneyLeft = totalIncome - totalExpense;

        //agar sab kuch thk chala to transaction ko commit karo
        await session.commitTransaction();
        session.endSession();

        //final response
        res.status(200).json({
            success: true,
            message: "transaction updated successfully and recalculated! ",
            summary: {
                totalIncome,
                totalExpense,
                moneyLeft,
                currency: 'INR'
            },
            data:updatedTransaction
        });

    } catch (error) {
       //ROLLBACK BACKUP: Agar beech me pure code me 1% bhi koi dikkat aayi
        // Toh database me jo kuch bhi badla tha, sab purane jaisa ho jayega!
        console.error("❌ ACID Transaction Failed! Rolling back changes...", error.message);
        await session.abortTransaction();
        session.endSession(); // Session safely closed!
        
        // Error ko global error handler ke paas bhej do
        return next(new ErrorResponse(`Update failed: ${error.message}`, 500));
    }
})

const getAllTransactions = asyncHandler(async (req, res, next) => {
    // Newest transactions sabse pehle dikhne chahiye, isiliye sort({ createdAt: -1 }) lagaya
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions
    });
});

 const transactionController = { addTransaction, getTransactionStats,processIncomingSms , updateManualTransaction, getAllTransactions };


export default transactionController