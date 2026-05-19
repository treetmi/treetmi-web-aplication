const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

/**
 * Public Routes
 */
// Webhook harus public agar bisa diakses oleh payment gateway
router.post('/webhook/callback', financeController.handleWebhook);
router.get('/donors-overlay/:token', financeController.getDonorsOverlay);

/**
 * Protected Routes
 */
router.post('/withdraw', verifyToken, financeController.requestWithdrawal);
router.post('/bank-account', verifyToken, financeController.updateBankAccount);
router.get('/history', verifyToken, financeController.getHistory);

module.exports = router;
