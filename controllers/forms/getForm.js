const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApiError } = require('../../utils/error/ApiError');

//@description     Get all form details based on user access
//@route           GET /api/form/getAllForms?id=<formId>
//@access          PUBLIC 
const getAllForms = async (req, res, next) => {
    try {
        let forms = null;
        if (req.query.id) {
            forms = await prisma.form.findUnique({
                where: {
                    id: req.query.id
                }
            });
        }
        else{
            forms = await prisma.form.findMany({});
        }

        // const filteredForms = forms.reduce((acc, form) => {
        //     // Filter out forms where isPublic is false
        //     if (!form.info.isPublic) return acc;

        //     // Remove sections from forms where isEventPast is true
        //     // form.sections = !(form.info.isRegistrationClosed) ? form.sections : null;

        //     // Add the form to the accumulator
        //     acc.push(form);
        //     return acc;
        // }, []);

        // console.log(filteredForms)

        res.status(200).json({
            success: true,
            message: 'All forms fetched successfully',
            events: forms
        });
    } catch (error) {
        console.error('Error while getting forms:', error);
        return next(new ApiError(500, 'Error while getting forms', error));
    }
};

module.exports = { getAllForms };
