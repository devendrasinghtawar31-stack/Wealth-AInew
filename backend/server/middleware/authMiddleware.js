import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../models/UserModel.js'
import ErrorResponse from '../../utils/errorResponse.js'
import {API , tokenStorage }  from '../../../frontend/src/config/api.js'


const protect = asyncHandler(async (req, res, next) => {
    let token;

    const authHeader = req.headers.authorization;

    // Check header
    if (authHeader && authHeader.startsWith('Bearer')) {
        try {
            token = authHeader.split(' ')[1];
            
            // JWT Verify
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch User
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return next(new ErrorResponse('User not found', 401));
            }

            req.user = user;
            return next(); // Return zaroori hai yahan!
        } catch (error) {
            // Agar token expired hai, toh yahan 401 jayega
            console.error("JWT Verification Error:", error.message);
            return next(new ErrorResponse('Token invalid or expired', 401));
        }
    }

    // Agar token hai hi nahi header mein
    if (!token) {
        return next(new ErrorResponse('Not authorized, no token', 401));
    }
});

export default protect