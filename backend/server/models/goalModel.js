import mongoose from "mongoose";
import User from "./UserModel.js";

const goalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Goal kisi user se juda hona zaroori hai"]
    },
    goalName: {
        type: String,
        required: [true, "Goal ka naam "],
        trim:true
    },
    targetAmount: {
        type: Number,
        required: [true, "Goal ka target amount "], 
        min:[1,"target kam se kam 1rupp to hona hi chahiye"]
    },
    currentSaved: {
        type: Number,
        default: 0,
        min :[0,]
    },
    status: {
        type: String,
        enum: ['active' , 'achieved'],
        default: 'active'
    },
    targetDate: {
        type: Date,
       
    }
}, {
    timestamps:true
})


const Goal = mongoose.model('Goal', goalSchema);
export default Goal;

