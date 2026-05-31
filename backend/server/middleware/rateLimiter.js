import rateLimit from 'express-rate-limit'
import ErrorResponse from '../../utils/errorResponse.js'

const smsLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 min ka window time
    max: 15, // 1 min me maxim user 15 bhj sakta hai
    handler: (req, res, next) => { 
        return next(new ErrorResponse("bhai app bht jaldi jaldi sms process kar raha hai,1 min baad try kare",429))
    },

    standardHeaders: true,
    legacyHeaders:false,
})

const orderLimiter =  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 min ka window time
    max: 5, // 5 min me maxim user 5 baar order create kar sakta hai
    handler: (req, res, next) => { 
        return next(new ErrorResponse("bar bar payment page mat kholo , 5min baad try karo",429))
    },

    standardHeaders: true,
    legacyHeaders:false,
})

const rateLimiter = { smsLimiter, orderLimiter }

export default rateLimiter