export const authDocs = {
    "/api/users/register": {
        post: {
            tags: ["Auth Module"],
            summary: "👤 Register New User",
            description: "Creates a new user profile in the database.",
            responses: {
                201: { description: "User registered successfully." },
                400: { description: "Validation error or user already exists." }
            }
        }
    },
    "/api/users/login": {
        post: {
            tags: ["Auth Module"],
            summary: "🔑 User Login",
            description: "Authenticates user credentials and returns a secure JWT Access Token and Refresh Token.",
            responses: {
                200: { description: "Login successful. Tokens returned." },
                401: { description: "Invalid email or password." }
            }
        }
    },
    // 🚀 NEW ENDPOINT ADDED: Refresh Access Token Node
    "/api/users/refresh-token": {
        post: {
            tags: ["Auth Module"],
            summary: "🔄 Refresh Access Token",
            description: "Takes a valid long-lived Refresh Token to generate a brand new short-lived JWT Access Token seamlessly in the background.",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["refreshToken"],
                            properties: {
                                refreshToken: {
                                    type: "string",
                                    description: "The secure refresh token received during login/verification.",
                                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: { 
                    description: "Access token rotated successfully.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    accessToken: { type: "string", example: "eyJhbGciOiJIUzI1Ni..." }
                                }
                            }
                        }
                    }
                },
                401: { description: "Invalid or expired Refresh Token. Re-authentication required." }
            }
        }
    },
    "/api/users/profile": {
        get: {
            tags: ["Auth Module"],
            summary: "📋 Get User Profile",
            description: "Fetches current logged-in user profile details using JWT.",
            security: [{ BearerAuth: [] }],
            responses: {
                200: { description: "Profile data fetched successfully." },
                401: { description: "Unauthorized! Token missing or invalid." }
            }
        }
    },
    "/api/users/update": {
        put: {
            tags: ["Auth Module"],
            summary: "🔄 Update User Profile",
            description: "Updates basic user information securely.",
            security: [{ BearerAuth: [] }],
            responses: {
                200: { description: "Profile updated successfully." },
                401: { description: "Unauthorized." }
            }
        }
    },
    "/api/users/send-otp": {
        post: {
            tags: ["Auth Module"],
            summary: "📲 Send OTP Verification",
            description: "Triggers a verification OTP to the user's mobile or email.",
            responses: {
                200: { description: "OTP sent successfully." }
            }
        }
    },
    "/api/users/forgotpassword": {
        post: {
            tags: ["Auth Module"],
            summary: "📧 Forgot Password Request",
            description: "Sends a secure password reset link/OTP to registered email.",
            responses: {
                200: { description: "Reset prompt sent successfully." },
                404: { description: "User not found." }
            }
        }
    },
    "/api/users/resetpassword": {
        put: {
            tags: ["Auth Module"],
            summary: "🔒 Reset Account Password",
            description: "Overwrites the old password with the new one using token/OTP validation.",
            responses: {
                200: { description: "Password reset successful." },
                400: { description: "Invalid or expired token." }
            }
        }
    },
    "/api/users/select-banks": {
        put: {
            tags: ["Auth Module"],
            summary: "🏦 Link Selected Banks",
            description: "Updates the user's preferred bank selections for auto-tracking.",
            security: [{ BearerAuth: [] }],
            responses: {
                200: { description: "Banks linked successfully." }
            }
        }
    }
};