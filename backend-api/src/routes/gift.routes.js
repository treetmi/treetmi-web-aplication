const express = require('express');
const router = express.Router();
const giftController = require('../controllers/gift.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Public: Daftar gift aktif untuk halaman donasi kreator
router.get('/public/gifts/:username', giftController.publicGetActiveGifts);

// Protected: Creator toggle gift settings
router.get('/my-gifts', verifyToken, giftController.creatorGetGiftSettings);
router.put('/my-gifts/:giftId', verifyToken, giftController.creatorToggleGift);

module.exports = router;
