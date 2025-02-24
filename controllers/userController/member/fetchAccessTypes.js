const express = require('express');
const router = express.Router();
const { AccessTypes } = require('@prisma/client');
const { ApiError } = require('../../../utils/error/ApiError');

//@description     Get all Access Types
//@route           GET /api/user/getAccessTypes
//@access          Admin
const fetchAccessTypes = async (req, res, next) => {
    try {
        // Return all access types
        res.status(200).json({ success: true, data: Object.values(AccessTypes) });
    } catch (error) {
        console.error('Error fetching access types:', error);
        next(new ApiError(500, 'Error fetching access types', error));
    }
};


module.exports = {fetchAccessTypes};
