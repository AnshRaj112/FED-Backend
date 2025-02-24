const { body } = require('express-validator');

const addFormValidationRules = () => [
    body('title')
        .notEmpty().withMessage('Title is required')
        .isString().withMessage('Title must be a string'),
    body('description')
        .notEmpty().withMessage('Description is required')
        .isString().withMessage('Description must be a string'),
    body('date')
        .notEmpty().withMessage('Date is required')
        .isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('isTeam')
        .isBoolean().withMessage('isTeam must be either true or false'),
    body('minteamsize')
        .optional({ checkFalsy: true })
        .isInt({ min: 1 }).withMessage('minteamsize must be an integer greater than 0'),
    body('maxteamsize')
        .optional({ checkFalsy: true })
        .isInt({ min: 1 }).withMessage('maxteamsize must be an integer greater than 0'),
    body('maxReg')
        .isInt({ min: 1 }).withMessage('maxReg must be an integer greater than 0'),
    body('eventName')
        .notEmpty().withMessage('Event name is required')
        .isString().withMessage('Event name must be a string'),
    body('active')
        .isBoolean().withMessage('Active must be either true or false'),
    body('upi')
        .optional().isString().withMessage('UPI must be a valid string'),
    body('mail')
        .isBoolean().withMessage('Mail must be either true or false'),
    body('extraData')
        .optional().isJSON().withMessage('extraData must be a valid JSON string'),
    body().custom((value, { req }) => {
        if (req.body.isTeam && req.body.maxteamsize <= req.body.minteamsize) {
            throw new Error('If isTeam is true, maxteamsize must be greater than minteamsize');
        }
        return true;
    })
];

module.exports = {
    addFormValidationRules
};
