const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const reportController = require('../controllers/report.controller');
const { verifyAdminToken } = require('../middlewares/auth.middleware');

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '../../uploads/reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, reportsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `report-${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`);
  }
});

// File validation and size limits (max 5MB)
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
    if (!allowed.includes(path.extname(file.originalname).toLowerCase())) {
      return cb(new Error('Hanya file bukti dengan format .png, .jpg, .jpeg, atau .webp yang diperbolehkan.'));
    }
    cb(null, true);
  }
});

// In-memory IP Rate Limiting (Max 3 reports per hour per IP)
const ipReportCounts = new Map();

// Clean map memory every hour to avoid leaks
setInterval(() => {
  ipReportCounts.clear();
}, 60 * 60 * 1000);

const reportRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const current = ipReportCounts.get(ip) || { count: 0, firstRequest: Date.now() };

  if (Date.now() - current.firstRequest > 60 * 60 * 1000) {
    // Reset window
    current.count = 1;
    current.firstRequest = Date.now();
  } else {
    current.count += 1;
  }

  ipReportCounts.set(ip, current);

  if (current.count > 3) {
    return res.status(429).json({
      success: false,
      message: 'Batas pengiriman laporan terlampaui. Anda hanya bisa mengirimkan maksimal 3 laporan per jam.'
    });
  }

  next();
};

// Error handling wrapper for Multer file upload errors
const uploadMiddleware = (req, res, next) => {
  upload.single('screenshot')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// ==========================================
// Public routes
// ==========================================
router.post('/', reportRateLimiter, uploadMiddleware, reportController.createReport);

// ==========================================
// Admin routes (Protected)
// ==========================================
router.get('/admin', verifyAdminToken, reportController.adminGetAllReports);
router.patch('/admin/:id', verifyAdminToken, reportController.adminUpdateReport);

module.exports = router;
