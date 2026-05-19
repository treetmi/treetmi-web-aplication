const jwt = require('jsonwebtoken');

/**
 * Middleware untuk memverifikasi JWT Token dari header Authorization
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Format: Bearer <token>
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Unauthorized: Token tidak ditemukan" 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    req.user = decoded; // Masukkan data user ke request
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: "Unauthorized: Token tidak valid atau telah kadaluarsa" 
    });
  }
};

module.exports = { verifyToken };
