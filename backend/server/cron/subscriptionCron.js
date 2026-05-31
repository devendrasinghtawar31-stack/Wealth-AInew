import cron from 'node-cron';
import User from '../models/UserModel.js';

const initSubscriptionCron = () => { 
    cron.schedule('0 0 * * * ', async () => { 
        console.log("--> cron job started : expired subscription ki jaanch ho rahi hai") 
        try {
             
            const currentDate = new Date();
            // isPremium === true hai//
            // 2. premiumValidUntil ki date aaj ki date se CHOTI ($lt = less than) ho chuki hai\
            const result = await User.updateMany(
                {
                    isPremium: true,
                    premiumValidUntil: {$lt : currentDate}
                },
                {
                    $set: {
                        isPremium: false,
                        subscriptionId:undefined//
                    }
                }
            )
            console.log(`--> Cron Job Completed: ${result.modifiedCount} users ka premium expire kiya gaya.`);

         } catch (error) {
            console.error("--> Cron Job Error:", error.message);
         }
    })
}

export default initSubscriptionCron