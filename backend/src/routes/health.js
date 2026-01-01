const express = require('express');
const router = express.Router();
const { healthCheck, readinessCheck, livenessCheck } = require('../controllers/healthController');

// Health check endpoint
router.get('/', healthCheck);

// Kubernetes readiness probe
router.get('/ready', readinessCheck);

// Kubernetes liveness probe
router.get('/live', livenessCheck);

module.exports = router;
