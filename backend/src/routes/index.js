const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const ticketRoutes = require('./tickets');
const analyticsRoutes = require('./analytics');
const healthRoutes = require('./health');
const emailController = require('../controllers/emailController');

// Health check (no auth required)
router.use('/health', healthRoutes);

// Authentication routes (no auth middleware on login/register)
router.use('/auth', authRoutes);

// Protected routes
router.use('/tickets', ticketRoutes);
router.use('/analytics', analyticsRoutes);

// Email routes
router.post('/email/send-password-reset-otp', emailController.sendPasswordResetOTP);
router.post('/email/send-verification-otp', emailController.sendEmailVerificationOTP);
router.post('/email/verify-otp', emailController.verifyOTP);

module.exports = router;
