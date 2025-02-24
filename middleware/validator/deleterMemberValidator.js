const { body } = require('express-validator');

const deleteMemberValidationRules = () => [
    body('email')
        .notEmpty()
        .isEmail().withMessage('Email is required')
];

module.exports = {
    deleteMemberValidationRules
};