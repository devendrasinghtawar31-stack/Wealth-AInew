import mongoose from "mongoose";

const virtualPortfolioSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cryptoName: {
        type: String,
        required: true,
        uppercase: true,
        trim:true
    },
    quantity: {
         type: Number,
        required: true,
        default:0
    },
    avgBuyPrice: {
           type: Number,
        required: true,
        default:0
    },

}, {
    timestamps: true
});


//ek user ek crypto ka ek hi portfolio record rakhega ,duplicate nahi banenge

virtualPortfolioSchema.index({ user: 1, cryptoName: 1 }, { unique: true });

const VirtualPortfolio = mongoose.model('VirtualPortfolio', virtualPortfolioSchema);
export default VirtualPortfolio;