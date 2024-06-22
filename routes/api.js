const express = require('express');
const router = express.Router();

// Define your routes here
router.get('/isWorking', (req, res) => {
    res.send('api.js file is working');
});

// Authentication Routes 
router.use('/auth', require('./auth/authRoutes'))



// User Routes
router.use('/user', require('./user/userRoutes'));

// Admin Routes - Example (Replace with actual admin routes)
// router.use('/admin', require('./admin/adminRoutes'));

// Event routes 
router.use('/form', require('./forms/formRoutes'));

module.exports = router; // Ensure you are exporting the router
