import logger from "../config/logger.js"; 

const errorHandler = (err, req, res, next) => {
    let error = err; 

    error.message = err.message;
    error.statusCode = err.statusCode || 500;

    //  Safe Logging with Winston 
    // Yeh line pure error aur uske stack trace ko 'logs/error.log' mein permanently save kar degi
    logger.error(` [API ERROR] Path: ${req.originalUrl} | Method: ${req.method} | Status: ${error.statusCode} | Message: ${error.message}`, {
        stack: err.stack // Winston isko automatic format karke file mein likh dega
    });

    
    res.status(error.statusCode).json({
        success: false,
        error: error.message || 'Server Error',
        // Production mein stack trace safe rakhega, local par dikhayega
        stack: process.env.NODE_ENV === 'production' ? null : err.stack 
    });
};

export default errorHandler;