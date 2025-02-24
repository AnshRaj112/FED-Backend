const { body } = require('express-validator');

const updateProfileValidationRules = () => [
    body('email')
        .optional().notEmpty()
        .isEmail().withMessage('Email should be correct'),
    body('name')
        .optional().notEmpty()
        .isString().withMessage('Name should be string'),
    body('access')
        .optional().notEmpty()
        .isInt().withMessage('Access should be integer'),
    body('year')
        .optional().notEmpty()
        .isInt().withMessage('Year should be integer'),
    body('rollNumber')
        .optional().notEmpty()
        .isInt().withMessage('Roll number should be integer'),
    body('school')
        .optional().notEmpty()
        .isString().withMessage('School should be string'),
    body('college')
        .optional().notEmpty()
        .isString().withMessage('College should be string'),
    body('contactNo')
        .optional().notEmpty()
        .isString().withMessage('Contact number should be string'),
    body('whatsappNo')
        .optional().notEmpty()
        .isString().withMessage('Whatsapp number should be string'),
    body('member.department')
        .optional().notEmpty()
        .isString().withMessage('Department should be string'),
    body('member.role')
        .optional().notEmpty()
        .isString().withMessage('Role should be string'),
    body('member.linkedin')
        .optional().notEmpty()
        .isURL().withMessage('LinkedIn profile should be url'),
    body('member.img')
        .optional().notEmpty()
        .isString().withMessage('Image URL should be string'),
    body('member.github')
        .optional().notEmpty()
        .isURL().withMessage('GitHub profile should be url')
];

module.exports = {
    updateProfileValidationRules
};
