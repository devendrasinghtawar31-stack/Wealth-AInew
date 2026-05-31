export const paymentDocs = {
    "/api/payments/create-order": {
        post: {
            tags: ["Payments Module"],
            summary: "💳 Create Razorpay Subscription Order",
            description: "Generates a unique Razorpay Order ID for frontend checkout. Protected by orderLimiter.",
            security: [{ BearerAuth: [] }],
            responses: {
                200: { description: "Order created successfully. Returns order details." },
                429: { description: "Too Many Requests! Subscription order creation rate limited." }
            }
        }
    },
    "/api/payments/verify-payment": {
        post: {
            tags: ["Payments Module"],
            summary: "🔑 Verify Razorpay Payment Signature",
            description: "Verifies the payment signature returned by the frontend after checkout to unlock premium status.",
            security: [{ BearerAuth: [] }],
            responses: {
                200: { description: "Payment verified and membership unlocked successfully." },
                400: { description: "Invalid signature! Payment verification failed." }
            }
        }
    }
};