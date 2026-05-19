const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

/**
 * Route: POST /api/v1/test-webhook
 */
router.post('/test-webhook', webhookController.testWebhook);

module.exports = router;
