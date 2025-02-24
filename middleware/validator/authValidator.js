// middleware/validator/authValidator.js
const { body } = require('express-validator');

const registerValidationRules = () => [
    body('email').isEmail().withMessage('Must be a valid email'),
    body('password').isLength({ min: 1}).withMessage('Password must be at least 6 characters long'),
    body('name').notEmpty().withMessage('Name is required')
];

const loginValidationRules = () => [
    body('email').isEmail().withMessage('Must be a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

module.exports = {
    registerValidationRules,
    loginValidationRules
};
