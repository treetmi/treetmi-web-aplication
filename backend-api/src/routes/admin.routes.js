const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const userController = require('../controllers/user.controller');
const { verifyAdminToken } = require('../middlewares/auth.middleware');

// ==========================================
// Authentication & 2FA Routes (Unprotected)
// ==========================================
router.post('/login', adminController.loginAdmin);
router.post('/login/2fa', adminController.loginAdmin2FA);

// ==========================================
// Protected Routes (Require verifyAdminToken)
// ==========================================

// Auth & 2FA Setup
router.post('/change-password', verifyAdminToken, adminController.changePassword);
router.get('/2fa/status', verifyAdminToken, adminController.get2FAStatus);
router.post('/2fa/setup', verifyAdminToken, adminController.setup2FA);
router.post('/2fa/enable', verifyAdminToken, adminController.enable2FA);
router.post('/2fa/disable', verifyAdminToken, adminController.disable2FA);

// Creators Management
router.get('/creators', verifyAdminToken, adminController.getAllCreators);
router.post('/creators', verifyAdminToken, adminController.createCreator);
router.put('/creators/:id', verifyAdminToken, adminController.updateCreator);

// Withdrawals Management
router.get('/withdrawals', verifyAdminToken, adminController.getAllWithdrawals);
router.post('/withdrawals/:id/approve', verifyAdminToken, adminController.approveWithdrawal);
router.post('/withdrawals/:id/reject', verifyAdminToken, adminController.rejectWithdrawal);

// Transactions Management & Simulation
router.get('/transactions', verifyAdminToken, adminController.getAllTransactions);
router.post('/transactions/simulate', verifyAdminToken, adminController.simulateTransaction);

// Filter Words Management
router.get('/filter-words', verifyAdminToken, adminController.getAllFilterWords);
router.post('/filter-words', verifyAdminToken, adminController.createFilterWord);
router.post('/filter-words/bulk', verifyAdminToken, adminController.bulkCreateFilterWords);
router.delete('/filter-words/:id', verifyAdminToken, adminController.deleteFilterWord);

// Site Settings Management
router.get('/settings', verifyAdminToken, adminController.getSettings);
router.post('/settings', verifyAdminToken, adminController.saveSettings);

// WhatsApp Broadcast Logs
router.get('/whatsapp/logs', verifyAdminToken, adminController.getWhatsappLogs);

// Avatars Management
router.get('/avatars', verifyAdminToken, adminController.getAllAvatars);
router.post('/avatars', verifyAdminToken, adminController.createAvatar);
router.put('/avatars/:id', verifyAdminToken, adminController.updateAvatar);
router.delete('/avatars/:id', verifyAdminToken, adminController.deleteAvatar);

// Trust Badges Management
router.get('/trust-badges', verifyAdminToken, adminController.getAllTrustBadges);
router.post('/trust-badges', verifyAdminToken, adminController.createTrustBadge);
router.put('/trust-badges/:id', verifyAdminToken, adminController.updateTrustBadge);
router.delete('/trust-badges/:id', verifyAdminToken, adminController.deleteTrustBadge);

// Verification Management
router.post('/verification/:userId/approve', verifyAdminToken, userController.approveVerification);
router.post('/verification/:userId/reject', verifyAdminToken, userController.rejectVerification);

// System Gift Management (Animated GIFs with fixed prices)
const giftController = require('../controllers/gift.controller');
router.get('/gifts', verifyAdminToken, giftController.adminGetAllGifts);
router.post('/gifts', verifyAdminToken, giftController.adminCreateGift);
router.put('/gifts/:id', verifyAdminToken, giftController.adminUpdateGift);
router.delete('/gifts/:id', verifyAdminToken, giftController.adminDeleteGift);

module.exports = router;
