const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const userController = require('../controllers/user.controller');
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
router.get('/creators', userController.getPublicCreators); // Public directory
router.get('/settings/public', userController.getPublicSettings); // Public site settings
router.get('/widget/:token', userController.resolveWidgetToken); // OBS overlay resolver
router.get('/target-overlay/:token', userController.getTargetOverlay);
router.get('/trust-badges', userController.getAllTrustBadges);

// Protected Routes
router.put('/update', verifyToken, userController.updateProfile);
router.post('/upload-avatar', verifyToken, upload.single('avatar'), userController.uploadAvatar);
router.post('/upload-banner', verifyToken, upload.single('banner'), userController.uploadBanner);
router.post('/reset-token', verifyToken, userController.resetToken);
router.post('/verification/apply', verifyToken, verificationUpload.single('screenshot'), userController.applyVerification);

// Creator Media Settings Routes
router.get('/media-settings', verifyToken, userController.getMediaSettings);
router.put('/media-settings', verifyToken, userController.updateMediaSettings);

module.exports = router;

