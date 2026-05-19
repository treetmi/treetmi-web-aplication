const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

/**
 * User / Streamer Support Tickets (Protected)
 */
router.post('/', verifyToken, ticketController.createTicket);
router.get('/', verifyToken, ticketController.getTickets);

/**
 * Superadmin Support Tickets Management
 */
router.get('/admin', ticketController.adminGetAllTickets);
router.put('/admin/:id', ticketController.adminRespondTicket);

module.exports = router;
