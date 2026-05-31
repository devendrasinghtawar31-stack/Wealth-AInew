export const cryptoDocs = {
    "/api/crypto/spin": {
        post: {
            tags: ["Crypto & Rewards"],
            summary: "🎉 Execute Daily Spin Wheel Reward",
            description: "Credits spin rewards to the user wallet. Protected by Redis Idempotency and live Ledger Audit.",
            security: [{ BearerAuth: [] }, { IdempotencyKey: [] }],
            responses: {
                200: { description: "Success! Reward processed and ledger entry created safely." },
                400: { description: "Constraint Failure! User is trying to spin before 24 hours." },
                409: { description: "Duplicate Request! Blocked by Redis Idempotency Guard." },
                451: { description: "Security Breach! Live audit engine detected data tampering and FROZE the wallet." }
            }
        }
    },
    "/api/crypto/buy": {
        post: {
            tags: ["Crypto & Rewards"],
            summary: "📈 Buy Crypto Assets",
            description: "Deducts cash from wallet and adds crypto assets using Mongoose ACID Transactions.",
            security: [{ BearerAuth: [] }, { IdempotencyKey: [] }],
            responses: {
                200: { description: "Success! Crypto purchased successfully." },
                400: { description: "Insufficient balance or invalid token quantity." },
                409: { description: "Duplicate Request! Blocked by Redis." }
            }
        }
    },
    "/api/crypto/sell": {
        post: {
            tags: ["Crypto & Rewards"],
            summary: "📉 Sell Crypto Assets",
            description: "Sells crypto assets and credits cash back to the user wallet safely.",
            security: [{ BearerAuth: [] }, { IdempotencyKey: [] }],
            responses: {
                200: { description: "Success! Crypto sold successfully." },
                400: { description: "Insufficient asset quantity to sell." },
                409: { description: "Duplicate Request! Blocked by Redis." }
            }
        }
    },
    "/api/crypto/redeem-subscription": {
        post: {
            tags: ["Crypto & Rewards"],
            summary: "👑 Redeem Premium Subscription",
            description: "Unlocks premium AI features by burning required coins via safe ledger entries.",
            security: [{ BearerAuth: [] }, { IdempotencyKey: [] }],
            responses: {
                200: { description: "Success! Subscription activated." },
                400: { description: "Insufficient coins for premium tier." },
                409: { description: "Duplicate Request! Blocked by Redis." }
            }
        }
    },
    "/api/crypto/portfolio": {
        get: {
            tags: ["Crypto & Rewards"],
            summary: "📊 Get User Crypto Portfolio",
            description: "Fetches live asset holdings, average buy price, and current total value.",
            security: [{ BearerAuth: [] }],
            responses: {
                200: { description: "Success! Portfolio data returned successfully." },
                401: { description: "Unauthorized! Token missing or invalid." }
            }
        }
    },
    "/api/crypto/history": {
        get: {
            tags: ["Crypto & Rewards"],
            summary: "📜 Get Transaction & Ledger History",
            description: "Fetches the complete audit passbook history (CREDIT/DEBIT logs) for the dashboard.",
            security: [{ BearerAuth: [] }],
            responses: {
                200: { description: "Success! Transaction logs returned successfully." },
                401: { description: "Unauthorized! Access Denied." }
            }
        }
    }
};