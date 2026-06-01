import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../models/UserModel.js'
import ErrorResponse from '../../utils/errorResponse.js'


const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for Authorization header (case-insensitive check is safer)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.toLowerCase().startsWith('bearer')) {
        try {
            // Safe split
            token = authHeader.split(' ')[1];

            // Verify
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // User fetch
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return next(new ErrorResponse('User not found with this token', 401));
            }

            req.user = user;
            next();
        } catch (error) {
            console.error("JWT Verification Error:", error.message);
            return next(new ErrorResponse('Token invalid or expired', 401));
        }
    }

    if (!token) {
        return next(new ErrorResponse('No token provided, access denied', 401));
    }
});

export default protect