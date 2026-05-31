export const aiDocs = {
    "/api/ai/advice": {
        get: {
            tags: ["Wealth AI Engine"],
            summary: "🤖 Get Financial Advice",
            description: "Triggers the AI engine to analyze user transaction trends and generate custom wealth-building insights.",
            security: [{ BearerAuth: [] }],
            responses: {
                200: { description: "AI financial insights returned successfully." },
                401: { description: "Unauthorized." }
            }
        }
    }
};