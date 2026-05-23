const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const userController = require('../controllers/user.controller');
const adminController = require('../controllers/admin.controller');
const mediaController = require('../controllers/media.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Pastikan folder uploads ada
const avatarsDir = path.join(__dirname, '../../uploads/avatars');
const verificationsDir = path.join(__dirname, '../../uploads/verifications');
if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });
if (!fs.existsSync(verificationsDir)) fs.mkdirSync(verificationsDir, { recursive: true });

// Multer config untuk avatar upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user?.id?.slice(0,8) || 'anon'}-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max for profile picture
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
    if (!allowed.includes(path.extname(file.originalname).toLowerCase())) {
      return cb(new Error('Hanya file .png, .jpg, .jpeg, .webp yang diizinkan.'));
    }
    cb(null, true);
  }
});

// Multer config untuk verification screenshot upload
const verificationStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, verificationsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `verify-${req.user?.id?.slice(0,8) || 'anon'}-${Date.now()}${ext}`);
  }
});
const verificationUpload = multer({
  storage: verificationStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max for verification screenshot
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
    if (!allowed.includes(path.extname(file.originalname).toLowerCase())) {
      return cb(new Error('Hanya file .png, .jpg, .jpeg, .webp yang diizinkan.'));
    }
    cb(null, true);
  }
});

// Public Routes
router.post('/register', userController.register);
router.post('/login-request', userController.loginRequest);
router.post('/verify-otp', userController.verifyOTP);
router.post('/google-auth', userController.googleAuth);
router.get('/profile/:username', userController.getProfile);
router.post('/profile/:username/whatsapp-alarm', userController.registerWhatsappAlarm);
router.get('/creators', userController.getPublicCreators); // Public directory
router.get('/settings/public', userController.getPublicSettings); // Public site settings
router.get('/avatars', userController.getAllAvatars); // Public list of avatars
router.get('/widget/:token', userController.resolveWidgetToken); // OBS overlay resolver
router.get('/target-overlay/:token', userController.getTargetOverlay);
router.get('/trust-badges', userController.getAllTrustBadges);
router.post('/media/resolve', mediaController.resolvePublicMedia);
router.post('/transactions/simulate', adminController.simulateTransaction);
router.get('/transactions/recent-feed', userController.getRecentFeed);

// Protected Routes
router.put('/update', verifyToken, userController.updateProfile);
router.post('/upload-avatar', verifyToken, upload.single('avatar'), userController.uploadAvatar);
router.post('/upload-banner', verifyToken, upload.single('banner'), userController.uploadBanner);
router.post('/reset-token', verifyToken, userController.resetToken);
router.post('/verification/apply', verifyToken, verificationUpload.single('screenshot'), userController.applyVerification);

// Creator Media Settings Routes
router.get('/media-settings', verifyToken, userController.getMediaSettings);
router.put('/media-settings', verifyToken, userController.updateMediaSettings);

// Creator Custom Filter Words Routes
router.get('/filter-words', verifyToken, userController.getCustomFilterWords);
router.post('/filter-words', verifyToken, userController.createCustomFilterWord);
router.delete('/filter-words/:id', verifyToken, userController.deleteCustomFilterWord);

// Creator Gacha Settings Routes
router.get('/gacha-settings', verifyToken, userController.getGachaSettings);
router.put('/gacha-settings', verifyToken, userController.updateGachaSettings);
router.get('/gacha-logs', verifyToken, userController.getGachaLogs);

// Creator Soundboard Routes
router.get('/soundboard', verifyToken, userController.getSoundboardSettings);
router.put('/soundboard', verifyToken, userController.updateSoundboardSettings);

module.exports = router;
