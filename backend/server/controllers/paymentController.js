import Razorpay from 'razorpay';
import asyncHandler from 'express-async-handler'
import ErrorResponse from '../../utils/errorResponse.js';
import crypto from 'crypto'
import User from '../models/UserModel.js';
import { json } from 'stream/consumers';


//Razor pay ko apni instance key dekar taiyyar kia

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createSubscriptionOrder = asyncHandler(async (req, res, next) => { 
    //premium sunscription ki amount fix kar dete hain rs:199
    //razorpay paise hamesa 'paise ,mein leta hai ,toh inr ko 100 semultipy karna pdega'

    const amountInPaise = 1 * 100;

    const options = {
        amount: amountInPaise,
        // Currency: "INR",
        receipt: `receipt_sub_${req.user?._id || 'guest_' + Math.floor(Math.random() * 1000)}` //unique recipt id

    };

    try {

        //razor pay ke server ko bolenge order create karne ke lie

        const order = await razorpayInstance.orders.create(options);

        if (!order) { 
            return next(new ErrorResponse("razorpy order generate nahi kar paya bhai", 500))
        }
        console.log("--> razorpay order created successfully", order._id);
        
        //frontend ko order details bhej do
        res.status(200).json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            Currency: "INR"
        });
        
    } catch (error) {
        console.error("Razorpay order Error", error);
        return next(new ErrorResponse("Razorpay gateway connectivity meon dikkat aayi hai" , 500))
        
    }
})
 
const verifyPayment = asyncHandler(async (req, res, next) => { 
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) { 
        return next(new ErrorResponse("verification ke lie saara data nahi milta bhai",400))
    }
    //signature verify karne ke lie text format taiyyar karo
    const textToHash = razorpay_order_id + "|" + razorpay_payment_id;

    //apni razorpay  key secret ka use karke sha256 hash banao

    const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(textToHash)
        .digest('hex')
    
    //match karo ki jo humne banaya aur jo razorpay ne bheja wp same hai ya nahi

    if (generated_signature === razorpay_signature ) {
        console.log("--> Payment signature verified successfull!");

        //data base me user ko premium banao
        const userId = req.user?._id;

        //subscription ko agle 30 di ke lie valid kar dete hai

        const validityDate = new Date();
        validityDate.setDate(validityDate.getDate() + 30);
await User.findByIdAndUpdate(userId, {
    // $set ke andar wo values jo directly change karni hain
    $set: {
        isPremium: true,
        subscriptionId: razorpay_payment_id,
        premiumValidUntil: validityDate
    },
    // $inc ke andar wo values jo badhani (plus) karni hain
    $inc: { 
        walletCoins: 100000 
    }
}, { new: true }); // { new: true } return karega updated document
        res.status(200).json({
            success: true,
            message: "mubarak ho bhai!payment verified aur premium activate ho gaya hai. "
        });

    } else { 
        //Agar kisi ne fake signature bhej kar hack karne ki koshish ki
        console.log("--> Alert: fake payment signature detected!")
        return next(new ErrorResponse("payment verification fail ho gaya . signature invalid hai"))
    }
})


const handleRazorpayWebhook = asyncHandler(async (req, res, next) => {
    // 1. Razorpay ke headers se unka bheja hua signature uthao
    const razorpaySignature = req.headers["x-razorpay-signature"];

    if (!razorpaySignature) {
        console.log("--> Webhook blocked: signature header missing hai!");
        return next(new ErrorResponse("Unauthorized: signature missing", 400));
    }

    // 2. Env se apni secret webhook key uthao
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // 3. Exact rawBody ka use karke local signature banao (No JSON order bug)
    const localSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(req.rawBody)
        .digest("hex");
    
    // 4. Signature compare karke hacker requests ko block karo
    if (localSignature !== razorpaySignature) {
        console.log("--> Webhook attack blocked: signature mismatched!");
        return next(new ErrorResponse("Unauthorized: signature mismatched", 400));
    }

    console.log("--> Webhook verified successfully! Asli Razorpay event received.");

    // 5. Body se event aur payload nikaalo (Typo Fixed: payload)
    const { event, payload } = req.body;

    // Hum sirf tabhi action lenge jab payment successfully capture ho chuki ho
    if (event === "payment.captured") {
        const paymentEntity = payload.payment.entity;

        // Frontend checkout ke waqt notes me bheji hui unique userId nikaalo
        const userId = paymentEntity.notes?.userId;
        const amountPaid = paymentEntity.amount / 100;

        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                // 30 din aage ki expiry date calculate karo
                const premiumExpiryDate = new Date();
                premiumExpiryDate.setDate(premiumExpiryDate.getDate() + 30);

                // User ko premium status, validity aur 1lkh bonus coins do
                user.isPremium = true;
                user.subscriptionStatus = 'active';
                user.premiumActivatedAt = new Date();
                user.premiumValidUntil = premiumExpiryDate; // Expiry logic merged
                user.walletCoins = (user.walletCoins || 0) + 100000; // Bonus coins added
                
                await user.save();

                console.log(`--> Premium & 500 coins activated for user: ${user.name} (Amount: ₹${amountPaid})`);
            } else { 
                console.log("--> Database me ye user ID nahi mili!");
            }
        } else {
            console.log("--> Alert: Webhook me userId nahi mili! Make sure frontend passes notes.userId");
        }
    }

    // 6. MOST CRITICAL STEP: Razorpay ko hamesha 200 OK dekar free karo
    res.status(200).json({
        status: "success",
        message: "Webhook processed successfully"
    });
});

const paymentController = { createSubscriptionOrder , verifyPayment ,handleRazorpayWebhook}

export default paymentController