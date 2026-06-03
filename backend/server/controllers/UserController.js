import asyncHandler from 'express-async-handler';
import User from "../models/UserModel.js";
import ErrorResponse from "../../utils/errorResponse.js"; // Teri banayi hui file
import bcrypt from 'bcryptjs';
import protect from '../middleware/authMiddleware.js';
import crypto from 'crypto';
import OTP from '../models/OTP.model.js';
import sendEmail from '../../utils/sendEmail.js';
import sendSMS from '../../utils/sendSMS.js';
import jwt from 'jsonwebtoken';
import { access } from 'fs';


// Ek helper function dono tokens ko ek sath sign (generate) karne ke liye
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_ACCESS_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { id: userId }, 
    process.env.JWT_REFRESH_SECRET, 
    { expiresIn: process.env.JWT_REFRESH_EXPIRY } 
  );

  return { accessToken, refreshToken };
};


//    Register User
// const registerUser = asyncHandler(async (req, res, next) => {
//     const { name, email, password, phone, otp, currency } = req.body;

//     if (!name || !email || !password ||!otp ||!phone) {
//         // Ab hum next(new ErrorResponse) use karenge jo tera preferred pattern hai
//         return next(new ErrorResponse("bhai, saari details fill karo", 400));
//     }

// //check if user exists already
//     const userExists = await User.findOne({
//         $or: [{email:email} , {phone:phone}]
//     });
//     if (userExists) {

//         const specificMessage = userExists.email === email
//             ? "bhai ,ye email to pehle se registered hai"
//             :"bhai ,ye phone number to pehle se registered hai"
//         return next(new ErrorResponse(specificMessage, 400));
//     }

//       const otpRecord = await OTP.findOne({

//         $or: [
//         { email: email, otp: otp },
//         { phone: phone, otp: otp }
//     ]
//     });

//     if (!otpRecord) {
//         return next(new ErrorResponse("OTP Expired OR Wrong,Try Again",400))
//     }

//     //create user

//     const user = await User.create({
//         name,
//         email,
//         password,
//         phone,
//         currency: currency || 'INR'
//     });
    
//     if (user) {
//         //registration ke baad otp delete

//         await OTP.deleteMany({ $or: [{ email }, {phone}] });

//         res.status(201).json({
//             success: true,
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//             phone: user.phone,
//             token: generateToken(user._id),
//             message: "Congratulations Your Account Has Been Registered"
//         });
//     } else {
//         return next (new ErrorResponse("kuch gadbad ho gai user nahi ban paya",400))
//     }

// });

const registerUser = asyncHandler(async (req, res, next) => {
    return next(new ErrorResponse("Bhai, yeh direct endpoint disabled hai. Unified verification portal (/verify-otp) use karo!", 404));
});


// @desc    Auth User & Get Token (Dual Login: Email OR Phone)
// @route   POST /api/users/login
const loginUser = asyncHandler(async (req, res, next) => {
    const { identifier, password } = req.body;

    // Strict validation checkpoint
    if (!identifier || !password) {
        return next(new ErrorResponse("Bhai, identifier (email/phone) aur password dono zaroori hain!", 400));
    }

    const cleanInput = identifier.toString().trim();
    
    // Dynamic Query array build matrix
    const loginConditions = [];

    if (cleanInput.includes('@')) {
        // Case A: Strict Email pattern matching
        loginConditions.push({ email: cleanInput.toLowerCase() });
    } else {
        // Case B: Strict Phone number pattern matching (+91 filters handle keys)
        const rawNumber = cleanInput.replace('+91', '').trim();
        const internationalNumber = `+91${rawNumber}`;
        
        loginConditions.push({ phone: rawNumber });
        loginConditions.push({ phone: internationalNumber });
    }

    // Single sweep array structure lookup search scan over indexed fields
    const user = await User.findOne({ $or: loginConditions });

    if (!user) {
        return next(new ErrorResponse("Bhai, ye identity database me registered nahi hai!", 401));
    }

    // Password verification via root model hooks lookup trigger check
    const isMatch = await bcrypt.compare(password, user.password);

    if (user && isMatch) {
        // Generate enterprise double security authentication layer passes
        const { accessToken, refreshToken } = generateTokens(user._id);
        
        return res.status(200).json({
            success: true,
            _id: user._id,
            name: user.name,
            email: user.email || "",
            phone: user.phone || "",
            token: accessToken,
            refreshToken: refreshToken,
            isPremium: user.isPremium || false,
            associatedBanks: user.associatedBanks || []
        });
    } else {
        return next(new ErrorResponse("Email ya Password galat hai bhai!", 401));
    }
});

//the refresh token controller
 const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return next(new ErrorResponse("Refresh token missing hai bhai, login karo!", 401));
    }

    try {
        // 💡 Synchronous Verification: Yeh bina kisi confusion ke direct .env ka refresh secret use karega
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        console.log("Secret being used:", process.env.JWT_REFRESH_SECRET);

        // Agar chabi asli hai, toh database se user verify karo
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new ErrorResponse("User hi nahi mila database mein!", 404));
        }

        // Ek brand new 5-minute ka Access Token banao
        const newAccessToken = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_ACCESS_EXPIRY }
        );

        // Chupchaap naya token return karo
        return res.status(200).json({
            success: true,
            accessToken: newAccessToken
        });

    } catch (error) {
        // Agar token sach mein expire ho gaya ya koi chhedchhad hui
        console.error("Verification Error:", error.message);
        console.log("Secret being used:", process.env.JWT_REFRESH_SECRET);
        return next(new ErrorResponse("Refresh token expire ya galat hai. Dubara login karo!", 403));
    }
});


//premium days left logic
const calculateDaysRemaining = (premiumValidUntil) => { 
    if (!premiumValidUntil) return 0;
    const currentDate = new Date();
    const expiryDate = new Date(premiumValidUntil);

    //dodno dates ka difference milliseconds mein nikalo
    const differenceInTime = expiryDate.getTime() - currentDate.getTime();

    //milliseconds ko days mein convert karo
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24))

    //agar days0 se bade hai toi return karo , nahi to o
    return differenceInDays > 0 ? differenceInDays : 0;
    
}

//get profile

const getUserProfile = asyncHandler(async (req, res, next) => { 
    //req.user._id hamein protect middleware  se mil raha hai

    const user = await User.findById(req.user._id);

    if (!user) { 
        return next (new ErrorResponse("user nahi mila bhai",404))
    }

    //bahce hue din nikalo helper function se 
    let daysLeft = calculateDaysRemaining(user.premiumValidUntil);

    //agar din khatam ho gae hai par database mein abhi bhi true hi hain
    if (user.isPremium && daysLeft === 0) { 
        user.isPremium = false;
        user.subscriptionId = undefined;
        await user.save();
    }

        res.status(200).json({
        
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                currency: user.currency,
                daysRemaining: daysLeft,    
            phone: user.phone,
            isPremium: user.isPremium || false,
            associatedBanks: user.associatedBanks || [],
            //  THE CRITICAL KEY MATCH: Yeh exact key bhejni zaroori hai refresh handle karne ke liye!
            walletCoins: user.walletCoins || 0, 
            spinReward: user.spinReward || { lastSpunAt: null, spinStreak: 0 }

            }
        })
        

})


//Update User

const updateUserProfile = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.user._id);

    if (!user) {
        return next(new ErrorResponse("user nahi mila ,kese update kare", 404))
        
    }
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.currency = req.body.currency || user.currency;

    //agar password badla hai to

    if (req.body.password) {
        user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({

        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        currency: updatedUser.currency,
        token: generateToken(updatedUser._id), // Token update karna professional practice hai
         isPremium: user.isPremium,
                associatedBanks: user.associatedBanks,
                daysRemaining: daysLeft

    })

});


const sendOTP = asyncHandler(async (req, res, next) => {
    const { email, phone, method, notificationMethod } = req.body;
    
    // Frontend se 'method' ya 'notificationMethod' dono me se jo bhee aaye use catch karo
    const activeMethod = method || notificationMethod;

    if (!activeMethod || (activeMethod === 'email' && !email) || (activeMethod === 'phone' && !phone)) {
        return next(new ErrorResponse("bhai , (method) email/ phone sahi chahiye", 400));
    }

    // 👑 SENIOR DEV COMPACT LOCK: Identifiers filter parsing architecture
    const identity = activeMethod === 'email' ? email : phone;
    const searchPhone = activeMethod === 'phone' && !phone.startsWith('+91') ? `+91${phone}` : phone;

    // 🚀 STEP 1: OTP BHEJNE SE PEHLE HI DUPLICATE SCAN CHECKPOST TRIGGER
    const userExists = await User.findOne({
        $or: [
            ...(email ? [{ email: email }] : []),
            ...(phone ? [{ phone: phone }, { phone: searchPhone }] : [])
        ]
    });

    // User agar pehle se registered hai to pipeline ko yahi block kar do!
    if (userExists) {
        const specificMessage = (userExists.email && userExists.email === email)
            ? "bhai, ye email to pehle se registered hai, direct login karo"
            : "bhai, ye phone number to pehle se registered hai, direct login karo";
            
        return next(new ErrorResponse(specificMessage, 400));
    }

    // 6 digit random otp generate
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // database (otp model) me save karna - purana otp delete karke naya save karna 
    await OTP.deleteMany({ 
        $or: [
            ...(email ? [{ email }] : []),
            ...(phone ? [{ phone }, { phone: searchPhone }] : [])
        ] 
    });
    
    // 👑 ALIGNMENT FIX: 'method' ki jagah strictly 'activeMethod' ka check mapping use kiya
    await OTP.create({
        email: activeMethod === 'email' ? email : undefined,
        phone: activeMethod === 'phone' ? searchPhone : undefined,
        otp,
        purpose: 'register'
    });

    // email/sms content template string setup
    const messageContent = ` OTP to Register in Wealth AI : ${otp}. Valid for only 5 min.`;

    try {
        if (activeMethod === 'phone') {
            console.log("DEBUG: Calling sendSMS with:", { phone: searchPhone, message: messageContent });
            // sms bhjo via dynamic secure layout wrapper
            await sendSMS({
                phone: searchPhone, // Pass cleanly evaluated formatted number
                message: messageContent
            });
        } else { 
            // html design start
            const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px;">
                <div style="text-align: center;">
                    <h1 style="color: #2ecc71; margin-bottom: 10px;">WealthAI</h1>
                    <p style="color: #7f8c8d; font-size: 16px;">Aapka Personal Financial Advisor</p>
                </div>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <div style="padding: 10px 0;">
                    <p style="font-size: 16px; color: #333;">Bhai, <strong>WealthAI</strong> mein aapka swagat hai!</p>
                    <p style="font-size: 16px; color: #333;">Registration poora karne ke liye neeche diya gaya OTP use karein:</p>
                    <div style="background: #f9f9f9; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <h2 style="letter-spacing: 5px; font-size: 32px; color: #2c3e50; margin: 0;">${otp}</h2>
                    </div>
                    <p style="font-size: 14px; color: #e74c3c;"><strong>Dhyan dein:</strong> Ye OTP sirf 5 minute tak valid hai. Isse kisi ke saath share na karein.</p>
                </div>
                <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #bdc3c7;">
                    <p>© 2026 WealthAI Platform | Secured by Devendra</p>
                </div>
            </div>`;
            // html design end

            await sendEmail({
                email: email,
                subject: 'Wealth AI: Verify Your Account',
                message: messageContent,
                html: htmlContent
            });
        }

        res.status(200).json({
            success: true,
            message: `OTP ${activeMethod === 'phone' ? 'Phone' : 'Email'} par bhej dia gaya hai!`
        });
    } catch (error) {
        console.log("TWILIO / NODEMAILER ERROR: ", error);
        await OTP.deleteMany({ 
            $or: [
                ...(email ? [{ email }] : []),
                ...(phone ? [{ phone }, { phone: searchPhone }] : [])
            ] 
        });
        return next(new ErrorResponse('otp nahi ja paya , configuration check kar ', 500));
    }
});


const forgotPassword = asyncHandler(async (req, res, next) => {
    const { identity, method } = req.body;

    // 1. Validation
    if (!identity || !method) {
        return next(new ErrorResponse("Identity aur method dono zaroori hain", 400));
    }

    const phoneRaw = identity.trim();
    const phoneWithCode = phoneRaw.startsWith('+91') ? phoneRaw : `+91${phoneRaw}`;
    const emailNormalized = identity.toLowerCase().trim();

    // 2. Smart User Lookup (Handles both formats)
    const user = await User.findOne({
        $or: [
            { email: emailNormalized },
            { phone: phoneRaw },
            { phone: phoneWithCode }
        ]
    });

    if (!user) {
        return next(new ErrorResponse("Is identity se koi user nahi mila", 404));
    }

    // 3. OTP Generation
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Cleanup old OTPs for this user (Purpose: forgot)
    await OTP.deleteMany({ 
        purpose: 'forgot', 
        $or: [{ email: user.email }, { phone: user.phone }] 
    });

    // 5. Create new OTP record
 // 5. Create new OTP record (Dono fields save karo!)
await OTP.create({
    email: user.email, // Har baar save karo
    phone: user.phone, // Har baar save karo
    otp,
    purpose: 'forgot'
});

    const message = `Your WealthAI password reset OTP: ${otp}. Valid for 5 min only.`;

    // 6. Execution
    try {
        if (method === 'email') {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset OTP',
                message
            });
        } else if (method === 'phone') {
            const formattedPhone = user.phone.startsWith('+91') ? user.phone : `+91${user.phone}`;
            await sendSMS({
                phone: formattedPhone,
                message
            });
        } else {
            return next(new ErrorResponse("Invalid notification method", 400));
        }

        res.status(200).json({
            success: true,
            message: "OTP bhej diya gaya hai"
        });

    } catch (err) {
        console.error("FORGOT SYSTEM CATCH ERROR: ", err);
        // Cleanup on failure
        await OTP.deleteMany({ 
            purpose: 'forgot', 
            $or: [{ email: user.email }, { phone: user.phone }] 
        });
        return next(new ErrorResponse("OTP nahi ja paya, try again later", 500));
    }
});

const resetPassword = asyncHandler(async (req, res, next) => { 
    const { identity, otp, password } = req.body;

    const user = await User.findOne({
        $or: [{ email: identity }, { phone: identity }],
        resetPasswordOTP: otp,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) { 
        return next(new ErrorResponse("otp galat hai ya expire ho gaya hai",400))
    }

    //naya password set karo(pre save hook apne aap save kardega)
    user.password = password;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: "password successfully badal gaya hai, ab login karo"
    })

})

const updateSelectBanks = asyncHandler(async (req, res, next) => { 
    const { banks } = req.body;

    if (!banks || !Array.isArray(banks)) { 
        return next (new ErrorResponse("Bhai,banks ka array bhejna zaroori hai",400))
    }

    const isUserPremium = req.user.isPremium;

    if (!isUserPremium && banks.length > 2) { 
        console.log('--> security block: free user [${req.user.name}] ne ${banks.length} banks add karne ki koshih kari')
        return next (new ErrorResponse("bhai , free account mein app sirf 2 main banks hi add karsakte ho unlimited ke lie premium lo"))
    }

    //capitalize kar dete hain saare bank names ko consistency ke lie
    const cleanedBanks = banks.map(bank => bank.trim().toUpperCase());

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { associatedBanks: cleanedBanks },
        { returnDocument:'after', runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: "banks on boarding successfully completed!",
        associatedBanks: updatedUser.associatedBanks
    })
})


// @route   POST /api/users/verify-otp
// @route   POST /api/users/verify-otp
const verifyOTP = asyncHandler(async (req, res, next) => {
    // Register flow ke liye name, email, phone, password bhi expected hain
    const { otp, password, identity, flow, name, email, phone } = req.body;

    if (!otp || !identity || !flow) {
        return next(new ErrorResponse("OTP, Identity, aur Flow zaroori hain", 400));
    }

    const trimmedIdentity = identity.trim();
    const emailIdentity = trimmedIdentity.toLowerCase();

    // 1. UNIVERSAL OTP FINDER
    const otpRecord = await OTP.findOne({
        otp: otp.toString().trim(),
        purpose: flow,
        $or: [
            { email: emailIdentity },
            { phone: trimmedIdentity },
            { phone: `+91${trimmedIdentity}` }
        ]
    });

    if (!otpRecord) {
        console.log("OTP not found for:", { identity, otp, flow });
        return next(new ErrorResponse("OTP Expired ya galat hai, phir se try karo!", 400));
    }

    // 2. Action Logic based on Flow
    if (flow === 'forgot') {
        const user = await User.findOne({
            $or: [
                { email: emailIdentity },
                { phone: trimmedIdentity },
                { phone: `+91${trimmedIdentity}` }
            ]
        });

        if (!user) {
            return next(new ErrorResponse("User nahi mila!", 404));
        }

        user.password = password;
        await user.save();
    } 
    else if (flow === 'register') {
        // Naya user create karo
        const newUser = await User.create({
            name,
            email: email || emailIdentity,
            phone: phone || trimmedIdentity,
            password
        });

        if (!newUser) {
            return next(new ErrorResponse("User create karne mein dikkat aayi!", 500));
        }
    }

    // 3. Cleanup
    await OTP.deleteOne({ _id: otpRecord._id });
    
    return res.status(200).json({ 
        success: true, 
        message: flow === 'register' ? "Registration successful!" : "Verification successful!" 
    });
});
const userController = { registerUser, loginUser ,getUserProfile,updateUserProfile,sendOTP,forgotPassword,updateSelectBanks, refreshAccessToken , verifyOTP };

export default userController;