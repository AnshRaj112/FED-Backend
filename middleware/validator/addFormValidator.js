const { body } = require('express-validator');

const addFormValidationRules = () => [
    body('title')
        .notEmpty().withMessage('Title is required')
        .isString(),
    body('description')
        .notEmpty().withMessage('Description is required')
        .isString(),
    body('date')
        .notEmpty().withMessage('Date is required')
        .isISO8601(),
    body('isTeam')
        .isBoolean().withMessage('isTeam must be either true or false'),
    body('minteamsize')
        .isInt({ min: 1 }).withMessage('minteamsize must be an integer greater than 0'),
    body('maxteamsize')
        .isInt({ min: 1 }).withMessage('maxteamsize must be an integer greater than 0'),
    body('maxReg')
        .isInt({ min: 1 }).withMessage('maxReg must be an integer greater than 0'),
    body('eventName')
        .notEmpty().withMessage('Event name is required')
        .isString(),
    body('active')
        .isBoolean().withMessage('Active must be either true or false'),
    body('upi')
        .optional().isString().withMessage('UPI must be a correct'),
    body('mail')
        .isBoolean().withMessage('Mail must be either true or false'),
    body('extraData')
        .optional().isJSON().withMessage('extraData must be valid'),
    body().custom((value) => {
        if (value.isTeam && value.maxteamsize <= value.minteamsize) {
            throw new Error('If isTeam is true, maxteamsize must be greater than minteamsize');
        }
        return true;
    })
];

module.exports = {
    addFormValidationRules
};
