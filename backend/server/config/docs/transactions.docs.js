export const transactionDocs = {
    "/api/transactions": {
        post: {
            tags: ["Transactions Module"],
            summary: "➕ Add Manual Transaction",
            description: "Logs a manual credit or debit entry into the user's ledger.",
            security: [{ BearerAuth: [] }],
            responses: {
                201: { description: "Transaction logged successfully." },
                401: { description: "Unauthorized." }
            }
        },
        get: {
            tags: ["Transactions Module"],
            summary: "📈 Get Transaction Stats",
            description: "Fetches structured financial statistics, totals, and breakdown metrics for graphs.",
            security: [{ BearerAuth: [] }],
            responses: {
                200: { description: "Stats retrieved successfully." }
            }
        }
    },
    "/api/transactions/process-sms": {
        post: {
            tags: ["Transactions Module"],
            summary: "📱 Auto-Parse Financial SMS",
            description: "Extracts transaction data from banking SMS strings via LLM. Protected by smsLimiter (Rate Limit).",
            security: [{ BearerAuth: [] }],
            responses: {
                200: { description: "SMS successfully parsed and logged into database." },
                429: { description: "Too Many Requests! SMS parsing rate limit exceeded. Please try again later." }
            }
        }
    },
    "/api/transactions/update/{id}": {
        put: {
            tags: ["Transactions Module"],
            summary: "🔄 Update Manual Transaction",
            description: "Modifies an existing manual transaction entry using its ID.",
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "The unique ID of the transaction to update",
                    schema: { type: "string" }
                }
            ],
            responses: {
                200: { description: "Transaction updated successfully." },
                404: { description: "Transaction not found." }
            }
        }
    }
};