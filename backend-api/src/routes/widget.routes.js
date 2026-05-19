const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middlewares/auth.middleware');
const widgetController = require('../controllers/widget.controller');

// Pastikan folder uploads/sounds ada
const soundsDir = path.join(__dirname, '../../uploads/sounds');
if (!fs.existsSync(soundsDir)) fs.mkdirSync(soundsDir, { recursive: true });

// Multer config untuk sound upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, soundsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `sound-${req.user?.id?.slice(0,8) || 'anon'}-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp3', '.wav', '.ogg'];
    if (!allowed.includes(path.extname(file.originalname).toLowerCase())) {
      return cb(new Error('Hanya file .mp3, .wav, .ogg yang diizinkan.'));
    }
    cb(null, true);
  }
});

// Pastikan folder uploads/gifs ada
const gifsDir = path.join(__dirname, '../../uploads/gifs');
if (!fs.existsSync(gifsDir)) fs.mkdirSync(gifsDir, { recursive: true });

// Multer config untuk GIF upload
const gifStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, gifsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `gif-${req.user?.id?.slice(0,8) || 'anon'}-${Date.now()}${ext}`);
  }
});
const gifUpload = multer({
  storage: gifStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.gif', '.png', '.webp'];
    if (!allowed.includes(path.extname(file.originalname).toLowerCase())) {
      return cb(new Error('Hanya file .gif, .png, .webp yang diizinkan.'));
    }
    cb(null, true);
  }
});

// Public Routes
router.get('/public/:token', widgetController.getPublicSettings);

// Protected Routes
router.get('/', verifyToken, widgetController.getMySettings);
router.put('/', verifyToken, widgetController.updateSettings);
router.post('/upload-sound', verifyToken, upload.single('sound'), widgetController.uploadSound);
router.post('/upload-gif', verifyToken, gifUpload.single('gif'), widgetController.uploadGif);
router.post('/test-alert', verifyToken, widgetController.testAlert);

module.exports = router;
