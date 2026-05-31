import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, "bhai, kis cheez ka kharcha hai ye to likho"],
        trim: true,
        maxlength: [100, "Title 100 characters se bada nahi ho sakta"] // Senior touch: Input limit
    },
    amount: {
        type: Number,
        required: [true, "paisa kitna hai vo batana zaroori hai"],
        min: [0, "Amount negative nahi ho sakta bhai"] // Validation: Paisa 0 se kam nahi ho sakta
    },
    type: {
        type: String,
        required: true,
        enum: ['income', 'expense', 'pending'],
    },
    category: {
        type: String,
        required: [false],
        default: 'other',
        index: true // Category wise search fast karne ke liye
    },
    date: {
        type: Date,
        default: Date.now
    },

    merchant: {
        type: String,
        default: 'Unknown'
    },
    status: {
        type: String,
        enum: ['verified', 'unverified'], 
        default: 'verified'
    },
    rawText: {
        type: String,
        default:''
    },
    sender: {
        type: String,
        default:'Unknown'
    }
    ,
    smsHash: {
        type: String,
        unique: true,
        sparse: true 
    },



}, {
    timestamps: true
});

// --- SENIOR DEVELOPER ADDITION ---
// 1. Compound Index: User aur Date par indexing taaki dashboard fast load ho
transactionSchema.index({ user: 1, date: -1 });

// 2. Index for Type: Income/Expense filter ko fast karne ke liye
transactionSchema.index({ user: 1, type: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;3