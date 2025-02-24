// middleware/jsonParseErrorHandler.js
const { ApiError } = require('../utils/error/ApiError');

const jsonParseErrorHandler = (err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Bad JSON:', err);
        next(new ApiError(400, 'Invalid JSON payload', ['There was an error parsing the JSON data in the request body.']));
    } else {
        next(err);
    }
};

module.exports = jsonParseErrorHandler;
