import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Naam zaroori hai bhai"],
        trim: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        sparse: true,
        unique: true, // Ye database level par duplicate roktahai
        sparse: true  // Iska matlab hai ki agar phone nahi bhi hai toh error na aaye
    },
    password: {
        type: String,
        required: [true, "password bina security nahi"],
        minlength: [6, "kam se kam 6 characters rakho"]
    },

    currency: {
        type: String,
        default: "INR"
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    subscriptionId: {
        type: String,
        default: null
    },
    premiumValidUntil: {
        type: Date,
        default: null
    },

    associatedBanks: {
        type: [String],
        default: []
    },

    walletCoins: {
        type: Number,
        default: 0
    },

    spinReward: {
        lastSpunAt: {
            type: Date,
            default: null //shuruat me null rahega ,mtkb user ne kabhi spin nahi kia 
        }
    },
    spinStreak: {
        type: Number,
        default:0 //lagatar kitne din spin kia
    },
    
}, {
    timestamps: true
});

//  1. Password Match karne ka Method (Login ke liye)

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

//  2. Password Hashing Hook (Save hone se pehle)

userSchema.pre('save', async function () { // 'next' yahan add kiya hai
    
    // If password is not modified, move to next middleware
    
    if (!this.isModified('password')) {
        return;
    }

    try {
        // rounds of hashing
        const salt = await bcrypt.genSalt(10);
         // hashing password
        this.password = await bcrypt.hash(this.password, salt);
 
    } catch (error) {
        throw error
    }
});

const User = mongoose.models && mongoose.models.User 
    ? mongoose.models.User 
    : mongoose.model("User", userSchema);

export default User;