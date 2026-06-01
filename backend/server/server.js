import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import dns from "dns";
import colors from "colors"
import morgan from "morgan";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import path from 'path';
import { fileURLToPath } from 'url';



// local imports 
import db from "./config/db.js"
const { connectDB, connectRedis } = db;   //ye line neeche agar db nahi likhenege to bhi chalega niche wala
import UserRoutes from "./routes/UserRoutes.js"
import errorHandler from "./middleware/errorHandler.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js"
import initSubscriptionCron from "./cron/subscriptionCron.js";
import aiRoutes from "./routes/aiRoutes.js";
import Routes from "twilio/lib/rest/Routes.js";
import goalRoutes from "./routes/goalRoutes.js";
import cryptoRoutes from "./routes/cryptoRoutes.js"
import cryptoController from "./controllers/cryptoController.js";
import logger from "./config/logger.js";//
import { setupSwagger } from "./config/swagger.js";
import bankRoutes from "./routes/bankRoutes.js"





//settings load
dotenv.config();
db.connectDB();
db.connectRedis();
initSubscriptionCron();
console.log("-->Background Cron Jobs Initialized!");

cryptoController.fetchAndCacheCryptoPrices();
setInterval(cryptoController.fetchAndCacheCryptoPrices, 30 * 1000);

const PORT = process.env.PORT || 5000;
const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


setupSwagger(app);//swagger documentaion ko express ke sath connect kia


app.use(cors({
    origin: [process.env.FRONTEND_URL || "https://wealth-ainew.onrender.com", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

//Middlewares
//webhook signature verification ke liye raw body ka buffer bachana zarroori hai
app.use(express.json({
    verify: (req, res, buf) => {
        if (req.originalUrl.includes('/api/webhooks')) {
            req.rawBody = buf; //sirf webhook wale routes ke lie asli raw data yaha save ho jaega
        }
    }
}));

app.use(express.urlencoded({ extended: true }));


//Routes(test)
app.get('/', (req, res) => {
    res.send("WealthAI Server Chal Raha Hai! 🚀");
});

//userroutes
app.use('/api/users', UserRoutes);

//transaction Routes

app.use('/api/transactions', transactionRoutes)

//Subscription payment routes
app.use('/api/payments' , paymentRoutes)

// AI Routes
app.use('/api/ai', aiRoutes);


// goal routes
app.use('/api/goals', goalRoutes)

//bank routes
app.use('/api/banks', bankRoutes);


//crypto routes
app.use("/api/crypto", cryptoRoutes)

// 1. Static folder ko serve karo (React build hone ke baad 'dist' folder banta hai)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// 2. Koi bhi request jo API routes mein match nahi hui, use index.html par bhej do
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});


//morgan ko bola ki har request ka dta winston ke combined.log me bhj dena
app.use(morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) }
}));


app.use(errorHandler)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`.bgMagenta));
