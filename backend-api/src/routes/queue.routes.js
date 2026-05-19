const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queue.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Public Route (Untuk widget/dashboard view)
router.get('/streamer', queueController.getStreamerQueue);
router.get('/ticker/:token', queueController.getTickerQueue);

// Protected Route (Hanya streamer yang bisa ganti status atau panggil)
router.post('/bulk-status', verifyToken, queueController.updateBulkQueueStatus);
router.patch('/:id/status', verifyToken, queueController.updateQueueStatus);
router.post('/:id/call', verifyToken, queueController.callQueueMember);

module.exports = router;
