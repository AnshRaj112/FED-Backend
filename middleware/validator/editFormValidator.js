const { body } = require('express-validator');

const editFormValidator = () => [
    body('title')
        .optional().isString().withMessage('Title is string'),
    body('description')
        .optional().isString().withMessage('Description is a string'),
    body('date')
        .optional().isISO8601().withMessage('Date is required'),
    body('isTeam')
        .optional().isBoolean().withMessage('isTeam should be either true or false'),
    body('minteamsize')
        .optional().isInt({ min: 1 }).withMessage('minteamsize should be an integer greater than 0'),
    body('maxteamsize')
        .optional().isInt({ min: 1 }).withMessage('maxteamsize should be an integer greater than 0'),
    body('maxReg')
        .optional().isInt({ min: 1 }).withMessage('maxReg should be an integer greater than 0'),
    body('eventName')
        .optional().isString().withMessage('Event name should be a string'),
    body('active')
        .optional().isBoolean().withMessage('Active should be either true or false'),
    body('upi')
        .optional().isString().withMessage('UPI should be correct'),
    body('mail')
        .optional().isBoolean().withMessage('Mail should be correct'),
    body('extraData')
        .optional().isJSON().withMessage('extraData should be valid'),
    body().custom((value) => {
        if (value.isTeam && value.maxteamsize <= value.minteamsize) {
            throw new Error('If isTeam is true, maxteamsize must be greater than minteamsize');
        }
        return true;
    })
];

module.exports = {
    editFormValidationRules
};
