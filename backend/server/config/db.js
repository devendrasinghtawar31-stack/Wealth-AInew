import mongoose from "mongoose"
import dotenv from "dotenv"
import { createClient } from "redis";

dotenv.config();

 const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected Successfully...".bgYellow);
        
    } catch (err) {
        console.error(err.message);
        process.exit(1);
        
    }

}

const redisClient = createClient({
url:'redis://127.0.0.1:6379'
})

redisClient.on('error', (err) => console.log('redis client error bhai:', err));

const connectRedis = async () => { 

    try {
        await redisClient.connect();
        console.log('redis memory DB connected successfully,pong'.bgWhite);
        
    } catch (error) {
        console.error('reddis connection failed'.bgRed)
        
    }
}

const db = { connectDB, connectRedis, redisClient }

export default db