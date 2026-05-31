import mongoose from "mongoose";

const coinTransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['BUY', 'SELL', 'REWARD', 'REFERRAL', 'SUB_REDEEM'] //kis wjhse transaction hua 
        
    },
    cryptoName: {
        type: String,
        uppercase: true,
        trim: true,
        required: [
            function () {
                return this.type === 'BUY' || this.type === 'SELL';
            }  //sirf trading me zarrori hai}
        ],
    },
        coinsInvolved: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            default: 'COMPLETED'
        },
    }
,{
    timestamps: true
});

const CoinTransaction = mongoose.model('CoinTransaction', coinTransactionSchema)
export default CoinTransaction