import mongoose from "mongoose";
import dotenv from "dotenv";
import { Redis } from "@upstash/redis";

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected Successfully...".bgYellow);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

// Upstash Redis Client
const redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const connectRedis = async () => {
    try {
        // Upstash ping karke check karta hai ki connected hai ya nahi
        const pong = await redisClient.ping();
        console.log('Redis memory DB connected successfully, pong:'.bgWhite, pong);
    } catch (error) {
        console.error('Redis connection failed:'.bgRed, error);
    }
};

const db = { connectDB, connectRedis, redisClient };

export default db;