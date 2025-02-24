const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../../utils/error/ApiError');

//@description     Fetch User by Dynamic Field
//@route           GET /api/user/query?value=<value>
//@access          Admin
const deleteUser = expressAsyncHandler(async (req, res, next) => {
    try {
        const { value } = req.query;

        if (!value) {
            return next(new ApiError(400, 'Value must be provided'));
        }

        // Fetch the user based on possible fields using OR condition
        const user = await prisma.user.delete({
            where: {
                OR: [
                    { email: value },
                    { rollNumber: value},
                    { contactNo: value },
                    { whatsappNo: value }
                ],
            },
        });

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        // Remove sensitive data like password before sending response
        delete user.password;

        res.status(200).json({ success: true, message:"User Deleted Successfully" , data: user });
    } catch (error) {
        console.error('Error fetching user:', error);
        next(new ApiError(500, 'Error fetching user', error));
    }
});

module.exports = { deleteUser };
