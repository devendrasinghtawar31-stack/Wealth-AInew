import mongoose from "mongoose"


const ledgerSchema = new mongoose.Schema(
    {

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: 'true',
            index:true, //fast searching k lie indexing zaroori hai
        },
        amount: {
            type: Number,
            required: true, //kitne coins ka khel hua 
        },
        type: {
            type: String,
            enum: ["CREDIT", "DEBIT"], 
            required: true,
        },
        source: {
            type: String,
            enum: ["DAILY_SPIN", "CRYPTO_BUY", "CRYPTO_SELL", "SUBSCRIPTION", "REVERSAL"],
            required:true,
        },
        description: {
            type: String,
            required:true,
        },
        runningBalanceAfter: {
            type: Number,
            required: true, //is transaction k just baad ka balance kitna hai.
        },

    }, {
    timestamps: true
}
);

const Ledger = mongoose.model('Ledger', ledgerSchema);
export default Ledger