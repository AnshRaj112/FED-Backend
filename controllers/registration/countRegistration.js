const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApiError } = require('../../utils/error/ApiError');

// @description     Get the number of registrations for a specific form
// @route           GET /api/form/registrationCount/:formId
// @access          Public
const getRegistrationCount = async (req, res, next) => {
    try {
        // Extract formId from request params
        const { formId } = req.params;

        // Check if the form exists
        const formExists = await prisma.form.findUnique({
            where: { id: formId },
            include: { formAnalytics: true }
        });

        if (!formExists) {
            return next(new ApiError(404, 'Form not found'));
        }

        // // Count the number of registrations for the form
        // const registrationCount = await prisma.formRegistration.count({
        //     where: { formId: formId }
        // });
        console.log(formExists);

        res.status(200).json({
            success: true,
            message: 'Registration count fetched successfully',
            form: { count: formExists }
        });
    } catch (error) {
        console.error('Error fetching registration count:', error);
        return next(new ApiError(500, 'Error fetching registration count', error));
    }
};

module.exports = { getRegistrationCount };
