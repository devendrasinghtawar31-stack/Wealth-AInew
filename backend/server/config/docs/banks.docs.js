export const bankDocs = {
    "/api/banks": {
        get: {
            tags: ["Bank Aggregator Module"],
            summary: "🏦 Fetch All Indian Supported Banks",
            description: "Server-side proxy engine that pulls real-time netbanking nodes directly from Razorpay endpoint. No CORS error on the browser client side, with embedded local production fallback mechanism.",
            security: [{ BearerAuth: [] }],
            responses: {
                200: {
                    description: "Success array containing structures of all active Indian financial institutions.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    count: { type: "number", example: 3 },
                                    data: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", example: "HDFC" },
                                                name: { type: "string", example: "HDFC Bank" },
                                                logo: { type: "string", example: "🏦" }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                401: { description: "Unauthorized! JWT Access token missing or invalid." }
            }
        }
    },
    "/api/banks/sync": {
        post: {
            tags: ["Bank Aggregator Module"],
            summary: "🎛️ Synchronize Chosen Bank Nodes",
            description: "Saves selected bank shortcodes permanently inside the user's profile schema array. Built-in Premium feature-gating verification system—rejects requests containing more than 2 banks if the user has not upgraded to Premium tier.",
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["selectedBanks"],
                            properties: {
                                selectedBanks: {
                                    type: "array",
                                    description: "List of banking institution unique string short-codes chosen by user.",
                                    example: ["HDFC", "SBIN"],
                                    items: { type: "string" }
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Selected nodes updated inside the user profile schema successfully. Background SMS parsing pipeline activated.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "🎉 Successfully mapped 2 bank nodes to your SMS Parsing Profile!" },
                                    associatedBanks: { type: "array", items: { type: "string" }, example: ["HDFC", "SBIN"] }
                                }
                            }
                        }
                    }
                },
                400: { description: "Validation error. Incorrect body structure or array pattern missing." },
                403: { description: "Premium Paywall Enforcement Block! Free tier users cannot exceed 2 linked banks configuration." },
                401: { description: "Unauthorized session token." }
            }
        }
    }
};