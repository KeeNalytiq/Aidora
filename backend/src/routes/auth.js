const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const authController = require('../controllers/authController');

// Public route for creating user profiles
router.post('/profile', authController.createUserProfile);

// Protected routes
router.get('/me', verifyToken, authController.getCurrentUser);
router.get('/engineers', verifyToken, authController.getEngineers);

module.exports = router;
