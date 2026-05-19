const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const userController = require('../controllers/user.controller');

// Creators Management
router.get('/creators', adminController.getAllCreators);
router.post('/creators', adminController.createCreator);
router.put('/creators/:id', adminController.updateCreator);

// Withdrawals Management
router.get('/withdrawals', adminController.getAllWithdrawals);
router.post('/withdrawals/:id/approve', adminController.approveWithdrawal);
router.post('/withdrawals/:id/reject', adminController.rejectWithdrawal);

// Transactions Management & Simulation
router.get('/transactions', adminController.getAllTransactions);
router.post('/transactions/simulate', adminController.simulateTransaction);

// Site Settings Management (Backend & Frontend File persistence)
router.get('/settings', adminController.getSettings);
router.post('/settings', adminController.saveSettings);

// Avatars Management
router.get('/avatars', adminController.getAllAvatars);
router.post('/avatars', adminController.createAvatar);
router.put('/avatars/:id', adminController.updateAvatar);
router.delete('/avatars/:id', adminController.deleteAvatar);

// Trust Badges Management
router.get('/trust-badges', adminController.getAllTrustBadges);
router.post('/trust-badges', adminController.createTrustBadge);
router.put('/trust-badges/:id', adminController.updateTrustBadge);
router.delete('/trust-badges/:id', adminController.deleteTrustBadge);

// Verification Management
router.post('/verification/:userId/approve', userController.approveVerification);
router.post('/verification/:userId/reject', userController.rejectVerification);

module.exports = router;
