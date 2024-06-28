const { PrismaClient, AccessTypes } = require('@prisma/client');
const prisma = new PrismaClient();
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../../utils/error/ApiError');
const createOrUpdateUser = require('../../../utils/user/createOrUpdateUser');

//@description     Update User Details
//@route           PUT /api/user/addMember
//@access          Admin
const addMember = expressAsyncHandler(async (req, res, next) => {
    try {

        if(!req.body.email || !req.body.access){
            return next(new ApiError(400, "Email and access is required"))
        }

        const { email, password, ...rest } = req.body;

        // Update the user details
        const updatedUser = await createOrUpdateUser({email : email},{},rest)

        delete updatedUser.password; // Delete password from updatedUser object

        console.log("Updated user:", updatedUser);

        res.status(200).json({ message: 'User updated successfully', data: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);

        // Handle specific Prisma errors
        if (error.code === 'P2002') {
            return next(new ApiError(400, 'Invalid request format', error));
        }
        next(new ApiError(500, 'Error updating user', error)); // Send error with ApiError
    }
});

module.exports = { addMember };
