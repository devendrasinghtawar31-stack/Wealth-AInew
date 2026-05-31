import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

// 📦 Saare alag-alag modules ko import kar rahe hain
import { authDocs } from "./docs/auth.docs.js";
import { cryptoDocs } from "./docs/crypto.docs.js";
import { transactionDocs } from "./docs/transactions.docs.js";
import { paymentDocs } from "./docs/payment.docs.js";
import { goalDocs } from "./docs/goals.docs.js";
import { aiDocs } from "./docs/ai.docs.js";
import { bankDocs } from "./docs/banks.docs.js";


const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "💎 Wealth AI - Complete Enterprise Backend API",
            version: "1.0.0",
            description: "Production-grade API documentation featuring Auth, Crypto Transactions, Redis Idempotency, AI ChatBot, Goal Tracking, and Secure Razorpay Integration.",
            contact: {
                name: "Devendra Singh Tawar"
            }
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Local Development Server"
            }
        ],
        components: {
            securitySchemes: {
                BearerAuth: { // 🔑 Global JWT Token Lock
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Enter your JWT token to access protected routes"
                },
                IdempotencyKey: { // 🛡️ Redis Idempotency Header
                    type: "apiKey",
                    in: "header",
                    name: "X-Idempotency-Key",
                    description: "Unique token for preventing duplicate transaction requests"
                }
            }
        },
        // 🚀 SPREAD OPERATOR (...) KA JADOO: Saari files ka data ek sath merge ho gaya
        paths: {
            ...authDocs,
            ...cryptoDocs,
            ...transactionDocs,
            ...paymentDocs,
            ...goalDocs,
            ...aiDocs,
            ...bankDocs
        }
    },
    apis: [] // Isko khali chhoda taaki koi purana comment scan na ho aur error na aaye
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

export const setupSwagger = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};