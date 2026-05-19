const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const paymentChannelController = require('../controllers/payment-channel.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Ensure uploads/payment-logos directory exists
const paymentLogosDir = path.join(__dirname, '../../uploads/payment-logos');
if (!fs.existsSync(paymentLogosDir)) {
  fs.mkdirSync(paymentLogosDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, paymentLogosDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const sanitizedName = file.originalname
      .replace(ext, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    cb(null, `logo-${sanitizedName}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
    if (!allowed.includes(path.extname(file.originalname).toLowerCase())) {
      return cb(new Error('Hanya berkas gambar (.png, .jpg, .jpeg, .webp, .svg) yang diizinkan.'));
    }
    cb(null, true);
  }
});

// PUBLIC ROUTES
router.get('/', paymentChannelController.getPublicChannels);

// ADMIN ROUTES (Protected)
router.get('/admin/list', paymentChannelController.getAdminChannels);
router.post('/admin/create', upload.single('logo'), paymentChannelController.createPaymentChannel);
router.put('/admin/update/:id', upload.single('logo'), paymentChannelController.updatePaymentChannel);
router.put('/admin/toggle/:id', paymentChannelController.togglePaymentChannel);
router.delete('/admin/delete/:id', paymentChannelController.deletePaymentChannel);


module.exports = router;
