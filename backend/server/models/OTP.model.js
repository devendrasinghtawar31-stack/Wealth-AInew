import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase:true,
        trim : true
    },
    phone: {
        type: String,
        // required: true,
        trim: true
    },
    otp: {
          type: String,
        required :[true, "OTP string is necessary"]
    },
    purpose: {
        type: String,
        required: [true, "bhai , otp ka purpose batao (register ya forgot)"],
        enum:['register' , 'forgot']
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300  // 5 min
    }
})

const OTP = mongoose.model('OTP',otpSchema)

export default OTP


// elcu vpvr gveg qywf