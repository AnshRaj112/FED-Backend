const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const { ApiError } = require('../utils/error/ApiError');

const verifyToken = async (req, res, next) => {
    console.log("VerifyToken middleware is being called");
    
    // Extract the token from cookies or headers
    let token = req.cookies.token;

    // Check if token exists and starts with "Bearer "
    if (token && token.startsWith("Bearer ")) {
        // Remove "Bearer " prefix
        token = token.slice(7);
    }

    console.log("Extracted Token:", token);

    if (!token) {
        console.log("Token not provided");
        return next(new ApiError(401, "Unauthorized: Token not provided"));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { maxAge: '70h' });

        console.log("Token verified");
        console.log(decoded);

        const user = await prisma.user.findUnique({
            where: { email: decoded.email } 
        });        

        if (!user) {
            console.log("User not found");
            return next(new ApiError(404, "User not found"));
        }

        req.user = user;
        next();

    } catch (err) {
        console.log("Error during token verification:", err);

        if (err.name === 'TokenExpiredError') {
            console.log("Token has expired");
            return next(new ApiError(401, "Unauthorized: Token has expired"));
        } else if (err.name === 'JsonWebTokenError') {
            console.log("Invalid token");
            return next(new ApiError(403, "Forbidden: Invalid token"));
        } else {
            console.log("Unexpected error");
            return next(new ApiError(500, "Internal Server Error"));
        }
    }
};

module.exports = { verifyToken };
