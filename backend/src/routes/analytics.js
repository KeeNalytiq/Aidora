const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const { getAnalytics, getTicketTrends } = require('../services/analyticsService');
const { getSLAStats } = require('../services/slaService');

// All analytics routes require authentication and admin/engineer role
router.use(verifyToken);
router.use(checkRole(['admin', 'engineer']));

// Get overall analytics
router.get('/', getAnalytics);

// Get ticket trends
router.get('/trends', getTicketTrends);

// Get SLA statistics
router.get('/sla', getSLAStats);

module.exports = router;
