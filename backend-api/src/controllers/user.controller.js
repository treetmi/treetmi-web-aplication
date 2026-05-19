const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

/**
 * Generate JWT Token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    const user = await userService.register(req.body);
    
    res.status(201).json({ 
      success: true, 
      message: 'Registrasi berhasil! Kode OTP verifikasi telah dikirim ke email Anda.', 
      data: {
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.loginRequest = async (req, res) => {
  try {
    const { username, email } = req.body;
    const identifier = username || email;

    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Email atau Username wajib diisi.' });
    }

    const user = await userService.loginRequest(identifier);
    
    res.status(200).json({ 
      success: true, 
      message: 'Kode OTP masuk telah dikirim ke email Anda.', 
      data: {
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { emailOrUsername, otp } = req.body;

    if (!emailOrUsername || !otp) {
      return res.status(400).json({ success: false, message: 'Email/Username dan kode OTP wajib diisi.' });
    }

    const user = await userService.verifyOTP(emailOrUsername, otp);
    const token = generateToken(user);
    
    res.status(200).json({ 
      success: true, 
      message: 'Verifikasi OTP berhasil! Selamat datang di Treetmi Hub.', 
      token,
      data: user
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getPublicSettings = async (req, res) => {
  try {
    const prisma = require('../config/prisma');
    let settings = await prisma.siteSetting.findFirst();
    if (!settings) {
      settings = {
        companyName: 'PT Asosiasi Karya Treetmi',
        logoText: 'treetmi',
        logoUrl: '',
        iconUrl: '',
        ahuNumber: '',
        pseNumber: '',
        nibNumber: '',
        paymentGateway: 'MIDTRANS',
        paymentSandbox: true
      };
    }
    res.status(200).json({
      success: true,
      data: {
        companyName: settings.companyName,
        logoText: settings.logoText,
        logoUrl: settings.logoUrl,
        iconUrl: settings.iconUrl,
        seoTitle: settings.seoTitle || '',
        ahuNumber: settings.ahuNumber || '',
        pseNumber: settings.pseNumber || '',
        nibNumber: settings.nibNumber || '',
        discordUrl: settings.discordUrl || '',
        xUrl: settings.xUrl || '',
        instagramUrl: settings.instagramUrl || '',
        tiktokUrl: settings.tiktokUrl || '',
        paymentGateway: settings.paymentGateway || 'MIDTRANS',
        paymentSandbox: settings.paymentSandbox !== undefined ? settings.paymentSandbox : true
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const profile = await userService.findByUsername(username);
    if (!profile) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

    // Verification now requires admin approval (no auto-approve)

    // Debug log — bisa dihapus setelah verified
    console.log(`[getProfile] username=${username} status=${profile.status}`);

    // Jika suspended, tetap kembalikan data LENGKAP + flag is_suspended
    // agar frontend bisa render profile di background sebagai dekorasi
    if (profile.status === 'SUSPENDED') {
      return res.status(200).json({
        success: true,
        is_suspended: true,
        data: profile  // data lengkap — frontend yang lock interaksinya
      });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Diambil dari verifyToken middleware
    
    const prisma = require('../config/prisma');
    
    // Daftar field link sosial media yang perlu divalidasi keunikannya
    const socialFields = [
      { field: 'youtube_url', label: 'YouTube' },
      { field: 'tiktok_url', label: 'TikTok' },
      { field: 'instagram_url', label: 'Instagram' },
      { field: 'twitch_url', label: 'Twitch' },
      { field: 'facebook_url', label: 'Facebook' },
      { field: 'discord_url', label: 'Discord' }
    ];

    for (const item of socialFields) {
      const urlValue = req.body[item.field];
      if (urlValue !== undefined && urlValue !== null && urlValue.trim() !== '') {
        const cleanUrl = urlValue.trim();
        // Cari apakah ada user LAIN yang sudah memakai link ini
        const existing = await prisma.user.findFirst({
          where: {
            id: { not: userId },
            [item.field]: {
              equals: cleanUrl,
              mode: 'insensitive'
            }
          }
        });

        if (existing) {
          return res.status(400).json({
            success: false,
            message: `Link ${item.label} sudah terdaftar pada kreator lain! Jika Anda merasa ini adalah akun resmi milik Anda, silakan ajukan tiket bantuan (Support Ticket) untuk proses klaim kepemilikan.`
          });
        }
        req.body[item.field] = cleanUrl;
      }
    }

    if (req.body.role_title !== undefined) {
      if (req.body.role_title === null) {
        return res.status(400).json({ success: false, message: 'Profesi tidak boleh kosong.' });
      }
      
      const trimmed = req.body.role_title.trim();
      if (!trimmed) {
        return res.status(400).json({ success: false, message: 'Profesi tidak boleh kosong.' });
      }
      if (trimmed.length > 100) {
        return res.status(400).json({ success: false, message: 'Nama profesi maksimal 100 karakter.' });
      }
      req.body.role_title = trimmed;
    }

    const updated = await userService.updateProfile(userId, req.body);
    
    // Emit real-time update to public profile page
    try {
      const { getIO } = require('../config/socket');
      const io = getIO();
      io.to(userId).emit('profile:updated', { userId, username: updated.username });
      console.log(`[Socket] profile:updated emitted for user ${userId}`);
    } catch (socketErr) {
      console.warn('[Socket] Failed to emit profile:updated:', socketErr.message);
    }
    
    res.status(200).json({ success: true, message: 'Profil diperbarui', data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.resetToken = async (req, res) => {
  try {
    const userId = req.user.id; // Diambil dari verifyToken middleware
    const updated = await userService.resetWidgetToken(userId);
    res.status(200).json({ success: true, message: 'Widget token di-reset', token: updated.widget_token });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Public: resolve widget_token → streamer_id (dipakai overlay OBS)
exports.resolveWidgetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const prisma = require('../config/prisma');
    const user = await prisma.user.findFirst({ where: { widget_token: token } });
    if (!user) return res.status(404).json({ success: false, message: 'Token widget tidak valid.' });
    res.status(200).json({ success: true, data: { streamer_id: user.id, username: user.username } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { email, name, avatarUrl } = req.body;
    const { user, token } = await userService.googleAuth({ email, name, avatarUrl });
    
    // Generate auth token
    const generatedToken = generateToken(user);
    
    res.status(200).json({ 
      success: true, 
      message: 'Otentikasi Google berhasil', 
      token: generatedToken,
      data: user 
    });
  } catch (error) {
    console.error('Error during googleAuth controller:', error);
    res.status(550).json({ success: false, message: error.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tidak ada file avatar yang diunggah.' });
    }
    
    const fs = require('fs');
    const { uploadToR2 } = require('../config/r2');
    
    let fileUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;
    let isUploadedToCloud = false;

    // Try to upload to Cloudflare R2
    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      const r2Url = await uploadToR2(fileBuffer, req.file.filename, req.file.mimetype, 'avatars');
      if (r2Url) {
        fileUrl = r2Url;
        isUploadedToCloud = true;
        
        // Clean up temporary local file
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkErr) {
          console.error('Failed to delete temp local file:', unlinkErr);
        }
      }
    } catch (r2Err) {
      console.error('Failed to upload avatar to R2, falling back to local storage:', r2Err);
    }
    
    // Update user's avatar_url in the database
    const prisma = require('../config/prisma');
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar_url: fileUrl }
    });
    
      // Emit real-time update to public profile page
      try {
        const { getIO } = require('../config/socket');
        const io = getIO();
        io.to(req.user.id).emit('profile:updated', { userId: req.user.id, username: updatedUser.username });
      } catch (socketErr) {
        console.warn('[Socket] Failed to emit profile:updated:', socketErr.message);
      }
      
      res.status(200).json({
        success: true,
        message: isUploadedToCloud 
          ? 'Avatar berhasil diunggah ke Cloudflare CDN dan diperbarui!' 
          : 'Avatar berhasil diunggah secara lokal dan diperbarui!',
        avatarUrl: fileUrl,
        data: updatedUser
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
  exports.uploadBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tidak ada file banner yang diunggah.' });
    }
    
    const fs = require('fs');
    const { uploadToR2 } = require('../config/r2');
    
    let fileUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;
    let isUploadedToCloud = false;

    // Try to upload to Cloudflare R2
    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      const r2Url = await uploadToR2(fileBuffer, req.file.filename, req.file.mimetype, 'banners');
      if (r2Url) {
        fileUrl = r2Url;
        isUploadedToCloud = true;
        
        // Clean up temporary local file
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkErr) {
          console.error('Failed to delete temp local file:', unlinkErr);
        }
      }
    } catch (r2Err) {
      console.error('Failed to upload banner to R2, falling back to local storage:', r2Err);
    }
    
      // Update user's banner_url in the database
      const prisma = require('../config/prisma');
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { banner_url: fileUrl }
      });
      
      // Emit real-time update to public profile page
      try {
        const { getIO } = require('../config/socket');
        const io = getIO();
        io.to(req.user.id).emit('profile:updated', { userId: req.user.id, username: updatedUser.username });
      } catch (socketErr) {
        console.warn('[Socket] Failed to emit profile:updated:', socketErr.message);
      }
      
      res.status(200).json({
      success: true,
      message: isUploadedToCloud 
        ? 'Banner berhasil diunggah ke Cloudflare CDN dan diperbarui!' 
        : 'Banner berhasil diunggah secara lokal dan diperbarui!',
      bannerUrl: fileUrl,
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Public: Get all creators for directory page (safe fields only, no sensitive data)
 */
exports.getPublicCreators = async (req, res) => {
  try {
    const prisma = require('../config/prisma');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        bio: true,
        role_title: true,
        avatar_url: true,
        banner_url: true,
        is_verified: true,
        is_live: true,
        status: true,
        _count: {
          select: {
            transactions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = users.map(u => {
      // Deterministic avatar fallback (same hash formula as admin controller)
      let avatar = u.avatar_url;
      if (!avatar || avatar.trim() === '') {
        let sum = 0;
        for (let i = 0; i < u.username.length; i++) {
          sum += u.username.charCodeAt(i);
        }
        avatar = `/avatars/avatar-${(sum % 8) + 1}.svg`;
      }

      return {
        username: u.username,
        name: u.username,
        bio: u.bio || null,
        role_title: u.role_title || 'Creator',
        avatar_url: avatar,
        banner_url: u.banner_url || null,
        is_verified: u.is_verified === true,
        is_live: u.status === 'SUSPENDED' ? false : u.is_live === true,
        status: u.status || 'ACTIVE',
        support_count: u._count?.transactions || 0
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('[getPublicCreators Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTargetOverlay = async (req, res) => {
  try {
    const { token } = req.params;
    const prisma = require('../config/prisma');

    const streamer = await prisma.user.findFirst({
      where: { widget_token: token }
    });

    if (!streamer) {
      return res.status(404).json({ success: false, message: 'Token widget tidak valid.' });
    }

    const aggregate = await prisma.transaction.aggregate({
      where: {
        streamer_id: streamer.id,
        status: 'SUCCESS'
      },
      _sum: {
        gross_amount: true
      }
    });

    const collected_amount = parseFloat(aggregate._sum.gross_amount) || 0;
    const target_amount = parseFloat(streamer.target_amount) || 0;
    const percentage = target_amount > 0 ? parseFloat(((collected_amount / target_amount) * 100).toFixed(2)) : 0;

    res.status(200).json({
      success: true,
      data: {
        title: streamer.target_title || 'Target Donasi',
        target_amount,
        collected_amount,
        percentage,
        show_target: streamer.show_target
      }
    });
  } catch (error) {
    console.error('[Target Overlay Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.applyVerification = async (req, res) => {
  try {
    const userId = req.user.id;
    const prisma = require('../config/prisma');
    const { platform, message } = req.body;

    // Validasi platform wajib diisi
    const validPlatforms = ['YOUTUBE', 'TIKTOK', 'INSTAGRAM', 'TWITCH', 'FACEBOOK', 'DISCORD'];
    if (!platform || !validPlatforms.includes(platform.toUpperCase())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Platform media sosial tidak valid. Pilih salah satu: YouTube, TikTok, Instagram, Twitch, Facebook, Discord.' 
      });
    }

    // Validasi screenshot wajib diupload
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Screenshot bukti kepemilikan akun wajib diunggah!' 
      });
    }

    // Ambil data user saat ini
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    // Cek apakah platform yang dipilih sudah diisi link-nya di profil
    const platformFieldMap = {
      'YOUTUBE': 'youtube_url',
      'TIKTOK': 'tiktok_url',
      'INSTAGRAM': 'instagram_url',
      'TWITCH': 'twitch_url',
      'FACEBOOK': 'facebook_url',
      'DISCORD': 'discord_url'
    };
    
    const requiredField = platformFieldMap[platform.toUpperCase()];
    if (!user[requiredField] || user[requiredField].trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: `Link ${platform} belum diisi di profil Anda. Silakan isi terlebih dahulu di tab Edit Profil.` 
      });
    }

    // Cek apakah sudah pernah mengajukan dan masih PENDING
    if (user.verification_status === 'PENDING') {
      return res.status(400).json({ 
        success: false, 
        message: 'Anda sudah memiliki pengajuan verifikasi yang sedang diproses. Mohon tunggu hasil review dari admin.' 
      });
    }

    // Upload screenshot ke storage
    const fs = require('fs');
    const { uploadToR2 } = require('../config/r2');
    
    let screenshotUrl = `${req.protocol}://${req.get('host')}/uploads/verifications/${req.file.filename}`;

    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      const r2Url = await uploadToR2(fileBuffer, req.file.filename, req.file.mimetype, 'verifications');
      if (r2Url) {
        screenshotUrl = r2Url;
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
    } catch (r2Err) {
      console.error('Failed to upload verification screenshot to R2:', r2Err);
    }

    // Generate token verifikasi
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const token = `TREETMI-VERIFY-${randomHex}`;

    // Simpan semua data verifikasi
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        verification_status: 'PENDING',
        verification_token: token,
        verification_submitted_at: new Date(),
        verification_screenshot_url: screenshotUrl,
        verification_platform: platform.toUpperCase(),
        verification_message: message || null,
        verification_reject_reason: null // Reset reject reason if re-applying
      }
    });

    res.status(200).json({ 
      success: true, 
      message: 'Pengajuan verifikasi berhasil dikirim! Tim admin kami akan meninjau bukti kepemilikan akun Anda. Mohon tunggu hasil review.',
      data: updated 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Approve verification request
 */
exports.approveVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const prisma = require('../config/prisma');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }
    if (user.verification_status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'User tidak memiliki pengajuan verifikasi yang pending.' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        is_verified: true,
        verification_status: 'VERIFIED'
      }
    });

    res.status(200).json({ 
      success: true, 
      message: `Verifikasi untuk ${user.username} berhasil disetujui!`,
      data: updated 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Reject verification request
 */
exports.rejectVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const prisma = require('../config/prisma');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }
    if (user.verification_status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'User tidak memiliki pengajuan verifikasi yang pending.' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        is_verified: false,
        verification_status: 'REJECTED',
        verification_reject_reason: reason || 'Tidak memenuhi syarat verifikasi.'
      }
    });

    res.status(200).json({ 
      success: true, 
      message: `Verifikasi untuk ${user.username} telah ditolak.`,
      data: updated 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllTrustBadges = async (req, res) => {
  try {
    const prisma = require('../config/prisma');
    const badges = await prisma.trustBadge.findMany({
      orderBy: { min_supporters: 'asc' }
    });
    res.status(200).json({ success: true, data: badges });
  } catch (error) {
    console.error('[getAllTrustBadges Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMediaSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const prisma = require('../config/prisma');
    let settings = await prisma.creatorMediaSetting.findUnique({
      where: { streamer_id: userId }
    });

    if (!settings) {
      settings = await prisma.creatorMediaSetting.create({
        data: { streamer_id: userId }
      });
    }

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error('[getMediaSettings Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMediaSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const prisma = require('../config/prisma');
    
    // Validate inputs
    const data = { ...req.body };
    // Remove un-updatable fields
    delete data.id;
    delete data.streamer_id;
    delete data.createdAt;
    delete data.updatedAt;

    const settings = await prisma.creatorMediaSetting.upsert({
      where: { streamer_id: userId },
      update: data,
      create: {
        streamer_id: userId,
        ...data
      }
    });

    res.status(200).json({ success: true, message: 'Media settings updated successfully', data: settings });
  } catch (error) {
    console.error('[updateMediaSettings Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
