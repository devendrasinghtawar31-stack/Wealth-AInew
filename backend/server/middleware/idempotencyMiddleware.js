import ErrorResponse from "../../utils/errorResponse.js";
import db from "../config/db.js"
const { redisClient } = db;


const checkIdempotency = (expireInSeconds = 15) => { 
    return async (req, res, next) => { 
        //header se unique key nikalo
        const idempotencyKey = req.headers["x-idempotency-key"];

        //agar frontedn ne key nhai bheji to safe side ke lie aage bhjo
        if (!idempotencyKey) { 
            return next();
        }

        const redisKey = `idempotency:${idempotencyKey}`;

        try {
            //redis mein check karo aur ek hi jhatke mein set if not exists {nx} chalao
            const isSet = await redisClient.set(redisKey, "STARTED", {
                NX: true, //only set if key does not exist
                EX: expireInSeconds //automatically expires in 15 seconds
            });

            //Agar isSet null ya false aaya mtlb key pehle se mojood hai(duplicate Attempt!)
            if (!isSet) {
                return next(new ErrorResponse("duplicate request! bhai ek hi baarclick karo ,processing chal rahi hai,", 409))
            }
            //agar naya hai ,toh res object mein key chipka do taaki response khatam hone par hum status change kar sakein (optional optimization)
            req.idempotencyKey = redisKey;

            next();
        
        } catch (error){ 
            console.error(`redis idempotency error: ${error.message}`.red);

            //agar redis down hai togh user ka flow nahi rukna chhiye(fallback to data base)
            next();
        }
    }
}

export default checkIdempotency