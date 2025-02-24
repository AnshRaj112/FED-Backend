const { body } = require('express-validator');

const addMemberValidationRules = () => [
    body('email')
        .notEmpty()
        .isEmail().withMessage('Email is required'),
    body('name')
        .optional()
        .isString().withMessage('Name should be a string'),
    body('access')
        .notEmpty()
        .isInt().withMessage('Access is required'),
    body('year')
        .optional()
        .isInt().withMessage('Year is required'),
    body('rollNumber')
        .optional()
        .isString().withMessage('Roll number is required'),
    body('member.department')
        .notEmpty()
        .isString().withMessage('Department is required'),
    body('member.role')
        .optional()
        .isString().withMessage('Role is required'),
    body('member.linkedin')
        .optional()
        .isURL().withMessage('LinkedIn profile is required'),
    body('member.github')
        .optional()
        .isURL().withMessage('GitHub profile is required')
];

module.exports = {
    addMemberValidationRules
};
