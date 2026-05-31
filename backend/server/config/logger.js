import winston from "winston";
import path from "path";

// Logs directory ka path set kiya
const logDir = "logs";

const logger = winston.createLogger({
    level: "info", // 👈 Iska matlab hai ki 'info' aur usse upar ke saare logs (warn, error) ko capture karna hai.
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // 👈 Har log ke sath sateek date aur time chipkayega.
        winston.format.errors({ stack: true }), // 👈 Agar code crash hua, toh kis line par crash hua, uska pura stack trace capture karega.
        winston.format.json() // 👈 Logs ko JSON format mein save karega, taaki AWS ya cloud systems isko aaram se read kar sakein.
    ),

    transports: [
        // 🚨 Iska matlab hai agar koi 'error' aayega, toh use special 'logs/error.log' file mein daalna hai.
        new winston.transports.File({ filename: path.join(logDir, "error.log"), level: "error" }),
        // 📊 Iska matlab hai app ke saare normal logs (choti-badi har request) ko 'logs/combined.log' mein save karna hai.
        new winston.transports.File({ filename: path.join(logDir, "combined.log") })
    ] 
});

// 💻 Agar production nahi hai (development mode hai), toh terminal par bhi mast color me chamkao
if (process.env.NODE_ENV !== "production") {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

export default logger;