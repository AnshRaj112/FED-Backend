const { param } = require('express-validator');

// Validation rules for deleting a form
const deleteFormValidationRules = () => [
    body('id')
        .notEmpty()
        .isString().withMessage('Form ID is required'),
];

module.exports = {
    deleteFormValidationRules
};
