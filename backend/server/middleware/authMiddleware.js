import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../models/UserModel.js'
import ErrorResponse from '../../utils/errorResponse.js'


const protect = asyncHandler(async (req, res, next) => { 
    
    let token;

    //checking if the header has authaorization or if it is starting with bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) { 
        try {
            
            //token nikalo (bearer alag token alag)
            token = req.headers.authorization.split(' ')[1];

            //token verification
            // console.log("Secret Key Check:", process.env.JWT_SECRET)

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            //user ka data nikalo

            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            return next(new ErrorResponse('bhai ,token galat hai, access denied',401))
            
        }
    }
    if (!token) {
        return next(new ErrorResponse('Bhai, Token hi nahi hai, login toh karo!', 401));
    }

})

export default protect