const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const { createTicketLimiter } = require('../middleware/rateLimiter');
const {
    createTicket,
    getTickets,
    getTicketById,
    updateTicket,
    addComment,
    resolveTicket,
    getSimilarTickets,
    rateTicket
} = require('../controllers/ticketController');

// All ticket routes require authentication
router.use(verifyToken);

// Create ticket (all authenticated users) - with rate limiting
router.post('/', createTicketLimiter, createTicket);

// Get all tickets (role-based filtering applied in controller)
router.get('/', getTickets);

// Get single ticket with details
router.get('/:id', getTicketById);

// Get similar tickets recommendations
router.get('/:id/recommendations', getSimilarTickets);

// Add comment to ticket
router.post('/:id/comments', addComment);

// Update ticket (engineers and admins only)
router.put('/:id', checkRole(['engineer', 'admin']), updateTicket);

// Resolve ticket (engineers and admins only)
router.post('/:id/resolve', checkRole(['engineer', 'admin']), resolveTicket);

// Rate ticket (customers only, for their own tickets)
router.post('/:id/rate', rateTicket);

module.exports = router;
