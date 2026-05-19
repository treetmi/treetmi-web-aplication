const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const partnerController = require('../controllers/partner.controller');

// Ensure uploads/partners directory exists
const partnerLogosDir = path.join(__dirname, '../../uploads/partners');
if (!fs.existsSync(partnerLogosDir)) {
  fs.mkdirSync(partnerLogosDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, partnerLogosDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const sanitizedName = file.originalname
      .replace(ext, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    cb(null, `partner-${sanitizedName}-${Date.now()}${ext}`);
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
router.get('/', partnerController.getPublicPartners);

// ADMIN ROUTES (CRUD)
router.get('/admin/list', partnerController.getAdminPartners);
router.post('/admin/create', upload.single('logo'), partnerController.createPartner);
router.put('/admin/update/:id', upload.single('logo'), partnerController.updatePartner);
router.put('/admin/toggle/:id', partnerController.togglePartner);
router.delete('/admin/delete/:id', partnerController.deletePartner);

module.exports = router;
