const { PrismaClient, AccessTypes } = require('@prisma/client');
const prisma = new PrismaClient();
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../../utils/error/ApiError');

//@description     Fetch Teams
//@route           GET /api/user/fetchTeam
//@access          Public
const fetchTeam = expressAsyncHandler(async (req, res, next) => {
    try {
        // Fetch users with specific access types
        const users = await prisma.user.findMany({
            where: {
                access: {
                    notIn: [AccessTypes.USER, AccessTypes.ADMIN]
                }
            },
            select: {
                id: true,
                name: true,
                access: true,
                img: true,
                email: true,
                extra: true
            }
        });

        if (users.length === 0) {
            return next(new ApiError(404, 'No teams found'));
        }

        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching teams:', error);
        next(new ApiError(500, 'Error fetching teams', error));
    }
});

module.exports = { fetchTeam };
