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
        ahuLogo: '',
        pseLogo: '',
        nibLogo: '',
        paymentGateway: 'MIDTRANS',
        paymentSandbox: true
      };
    }
    const fs = require('fs');
    const path = require('path');
    const ratesPath = path.join(__dirname, '../config/exchange_rates.json');
    let rates = { USD: 16000, MYR: 3400, SGD: 11800, PHP: 280, THB: 440 };
    try {
      if (fs.existsSync(ratesPath)) {
        rates = JSON.parse(fs.readFileSync(ratesPath, 'utf8'));
      }
    } catch (e) {
      console.error('Error reading exchange rates in public settings:', e);
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
        ahuLogo: settings.ahuLogo || '',
        pseLogo: settings.pseLogo || '',
        nibLogo: settings.nibLogo || '',
        discordUrl: settings.discordUrl || '',
        xUrl: settings.xUrl || '',
        instagramUrl: settings.instagramUrl || '',
        tiktokUrl: settings.tiktokUrl || '',
        showLeaderboard: settings.showLeaderboard !== undefined ? settings.showLeaderboard : false,
        paymentGateway: settings.paymentGateway || 'MIDTRANS',
        paymentSandbox: settings.paymentSandbox !== undefined ? settings.paymentSandbox : true,
        feeDonation: settings.feeDonation,
        feeMabar: settings.feeMabar,
        feeGift: settings.feeGift !== undefined ? settings.feeGift : 10,
        supportWhatsapp: settings.supportWhatsapp || '628123456789',
        rates: rates
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

    // Fetch current user details to check status before updating
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });

    const updated = await userService.updateProfile(userId, req.body);
    
    // Check if transitioning from NOT LIVE (is_live: false) to LIVE (is_live: true)
    if (req.body.is_live === true && currentUser && !currentUser.is_live) {
      try {
        const whatsappService = require('../services/whatsapp.service');
        whatsappService.broadcastLiveAlert(updated.id).catch(err => {
          console.error('[WhatsApp Broadcast Error]:', err);
        });
      } catch (waErr) {
        console.error('Failed to import or trigger WhatsApp service:', waErr);
      }
    }

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
        status: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const successfulTx = await prisma.transaction.findMany({
      where: {
        status: 'SUCCESS'
      },
      select: {
        streamer_id: true,
        sender_name: true,
        gross_amount: true
      }
    });

    const statsMap = {};
    successfulTx.forEach(tx => {
      const sId = tx.streamer_id;
      if (!statsMap[sId]) {
        statsMap[sId] = {
          gtv: 0,
          count: 0,
          supporters: new Set()
        };
      }
      statsMap[sId].gtv += parseFloat(tx.gross_amount || 0);
      statsMap[sId].count += 1;
      const donorName = (tx.sender_name || 'Anonymous').trim().toLowerCase();
      statsMap[sId].supporters.add(donorName);
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

      const stats = statsMap[u.id] || { gtv: 0, count: 0, supporters: new Set() };

      return {
        id: u.id,
        username: u.username,
        name: u.username,
        bio: u.bio || null,
        role_title: u.role_title || 'Creator',
        avatar_url: avatar,
        banner_url: u.banner_url || null,
        is_verified: u.is_verified === true,
        is_live: u.status === 'SUSPENDED' ? false : u.is_live === true,
        status: u.status || 'ACTIVE',
        gtv: stats.gtv,
        support_count: stats.count,
        supporter_count: stats.supporters.size
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

    let widgetSettings = await prisma.widgetSetting.findUnique({
      where: { streamer_id: userId }
    });

    const combinedSettings = {
      ...settings,
      mediashare_min_donation: widgetSettings ? Number(widgetSettings.mediashare_min_donation) : 15000,
      mediashare_enabled: widgetSettings ? widgetSettings.mediashare_enabled : true
    };

    res.status(200).json({ success: true, data: combinedSettings });
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
    const mediashare_min_donation = data.mediashare_min_donation;
    const mediashare_enabled = data.mediashare_enabled;

    // Remove non-CreatorMediaSetting fields from media settings update
    delete data.id;
    delete data.streamer_id;
    delete data.createdAt;
    delete data.updatedAt;
    delete data.mediashare_min_donation;
    delete data.mediashare_enabled;

    const settings = await prisma.creatorMediaSetting.upsert({
      where: { streamer_id: userId },
      update: data,
      create: {
        streamer_id: userId,
        ...data
      }
    });

    // Update WidgetSetting table for mediashare fields if provided
    if (mediashare_min_donation !== undefined || mediashare_enabled !== undefined) {
      const widgetData = {};
      if (mediashare_min_donation !== undefined) widgetData.mediashare_min_donation = Number(mediashare_min_donation);
      if (mediashare_enabled !== undefined) widgetData.mediashare_enabled = Boolean(mediashare_enabled);

      await prisma.widgetSetting.upsert({
        where: { streamer_id: userId },
        update: widgetData,
        create: {
          streamer_id: userId,
          ...widgetData
        }
      });
    }

    // Get final combined settings to return
    let widgetSettings = await prisma.widgetSetting.findUnique({
      where: { streamer_id: userId }
    });

    const combinedSettings = {
      ...settings,
      mediashare_min_donation: widgetSettings ? Number(widgetSettings.mediashare_min_donation) : 15000,
      mediashare_enabled: widgetSettings ? widgetSettings.mediashare_enabled : true
    };

    // Emit real-time update to public profile page
    try {
      const { getIO } = require('../config/socket');
      const io = getIO();
      io.to(userId).emit('profile:updated', { userId });
    } catch (socketErr) {
      console.warn('[Socket] Failed to emit profile:updated:', socketErr.message);
    }

    res.status(200).json({ success: true, message: 'Media settings updated successfully', data: combinedSettings });
  } catch (error) {
    console.error('[updateMediaSettings Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Creator Custom Filter Words: Get all custom words
 */
exports.getCustomFilterWords = async (req, res) => {
  try {
    const userId = req.user.id;
    const prisma = require('../config/prisma');

    const customWords = await prisma.filterWord.findMany({
      where: { userId },
      orderBy: { word: 'asc' }
    });

    const globalWords = await prisma.filterWord.findMany({
      where: { userId: null },
      orderBy: { word: 'asc' }
    });

    res.status(200).json({ 
      success: true, 
      data: {
        custom: customWords,
        global: globalWords
      } 
    });
  } catch (error) {
    console.error('[getCustomFilterWords Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Creator Custom Filter Words: Create new custom word
 */
exports.createCustomFilterWord = async (req, res) => {
  try {
    const userId = req.user.id;
    const { word, type } = req.body;
    const prisma = require('../config/prisma');

    if (!word) {
      return res.status(400).json({ success: false, message: 'Kata wajib diisi!' });
    }

    const cleanWord = word.trim().toLowerCase();

    // Check if exists in global list or for this user
    const existing = await prisma.filterWord.findFirst({
      where: {
        word: cleanWord,
        OR: [
          { userId },
          { userId: null }
        ]
      }
    });

    if (existing) {
      if (existing.userId === null) {
        return res.status(400).json({ success: false, message: `Kata "${cleanWord}" sudah terdaftar sebagai kata sensor global oleh sistem.` });
      }
      return res.status(400).json({ success: false, message: `Kata "${cleanWord}" sudah terdaftar di daftar kustom Anda.` });
    }

    const newWord = await prisma.filterWord.create({
      data: {
        word: cleanWord,
        type: type || 'GAMBLING',
        userId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Kata sensor kustom berhasil ditambahkan.',
      data: newWord
    });
  } catch (error) {
    console.error('[createCustomFilterWord Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Creator Custom Filter Words: Delete custom word
 */
exports.deleteCustomFilterWord = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const prisma = require('../config/prisma');

    const wordExists = await prisma.filterWord.findUnique({
      where: { id }
    });

    if (!wordExists) {
      return res.status(404).json({ success: false, message: 'Kata sensor kustom tidak ditemukan.' });
    }

    if (wordExists.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki hak untuk menghapus kata sensor ini.' });
    }

    await prisma.filterWord.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Kata sensor kustom berhasil dihapus.'
    });
  } catch (error) {
    console.error('[deleteCustomFilterWord Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all master avatars (public)
 */
exports.getAllAvatars = async (req, res) => {
  try {
    const prisma = require('../config/prisma');
    const avatars = await prisma.avatar.findMany({
      orderBy: { name: 'asc' }
    });
    res.status(200).json({ success: true, data: avatars });
  } catch (err) {
    console.error('Error fetching avatars:', err);
    res.status(500).json({ success: false, message: 'Server error fetching avatars.' });
  }
};

/**
 * Creator Gacha Settings: Get Settings & Wheel Items
 */
exports.getGachaSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const prisma = require('../config/prisma');

    let settings = await prisma.gachaSetting.findUnique({
      where: { streamer_id: userId }
    });

    if (!settings) {
      settings = await prisma.gachaSetting.create({
        data: { streamer_id: userId }
      });
    }

    const items = await prisma.gachaWheelItem.findMany({
      where: { streamer_id: userId },
      orderBy: { createdAt: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: {
        settings,
        items
      }
    });
  } catch (error) {
    console.error('[getGachaSettings Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Creator Gacha Settings: Save Settings & Sync Wheel Items
 */
exports.updateGachaSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { is_enabled, min_donation, duration_sec, items } = req.body;
    const prisma = require('../config/prisma');

    // Update settings
    const settings = await prisma.gachaSetting.upsert({
      where: { streamer_id: userId },
      update: {
        is_enabled: Boolean(is_enabled),
        min_donation: parseFloat(min_donation) || 10000.00,
        duration_sec: parseInt(duration_sec) || 5
      },
      create: {
        streamer_id: userId,
        is_enabled: Boolean(is_enabled),
        min_donation: parseFloat(min_donation) || 10000.00,
        duration_sec: parseInt(duration_sec) || 5
      }
    });

    // Sync wheel items (delete and recreate)
    if (Array.isArray(items)) {
      await prisma.gachaWheelItem.deleteMany({
        where: { streamer_id: userId }
      });

      if (items.length > 0) {
        await prisma.gachaWheelItem.createMany({
          data: items.map(item => ({
            streamer_id: userId,
            name: item.name,
            weight: parseInt(item.weight) || 1,
            color: item.color || "#FFD551"
          }))
        });
      }
    }

    const updatedItems = await prisma.gachaWheelItem.findMany({
      where: { streamer_id: userId },
      orderBy: { createdAt: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: {
        settings,
        items: updatedItems
      }
    });
  } catch (error) {
    console.error('[updateGachaSettings Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Creator Gacha Logs: Get Gacha Roll History
 */
exports.getGachaLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const prisma = require('../config/prisma');

    const logs = await prisma.gachaLog.findMany({
      where: { streamer_id: userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('[getGachaLogs Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Creator Soundboard: Get Soundboard Items
 */
exports.getSoundboardSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const prisma = require('../config/prisma');

    const items = await prisma.soundboardItem.findMany({
      where: { streamer_id: userId },
      orderBy: { createdAt: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('[getSoundboardSettings Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Creator Soundboard: Sync Soundboard Items (Create/Update/Delete)
 */
exports.updateSoundboardSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sounds } = req.body;
    const prisma = require('../config/prisma');
    const { processBase64Upload } = require('./admin.controller');

    if (!Array.isArray(sounds)) {
      return res.status(400).json({ success: false, message: 'Invalid sounds payload.' });
    }

    // Get current sound IDs to see which ones to delete
    const currentSounds = await prisma.soundboardItem.findMany({
      where: { streamer_id: userId }
    });
    const incomingIds = sounds.filter(s => s.id).map(s => s.id);
    const deleteIds = currentSounds.filter(s => !incomingIds.includes(s.id)).map(s => s.id);

    // Delete removed sounds
    if (deleteIds.length > 0) {
      await prisma.soundboardItem.deleteMany({
        where: { id: { in: deleteIds } }
      });
    }

    // Process updates and inserts
    for (const sound of sounds) {
      let finalSoundUrl = sound.sound_url || '';
      
      // Upload sound if it's base64
      if (finalSoundUrl.startsWith('data:')) {
        finalSoundUrl = await processBase64Upload(finalSoundUrl, sound.name || 'sound', 'sound', 'soundboard');
      }

      if (sound.id) {
        // Update
        await prisma.soundboardItem.update({
          where: { id: sound.id },
          data: {
            name: sound.name,
            sound_url: finalSoundUrl,
            price: parseFloat(sound.price) || 2000.00,
            is_active: sound.is_active !== undefined ? Boolean(sound.is_active) : true
          }
        });
      } else {
        // Insert
        await prisma.soundboardItem.create({
          data: {
            streamer_id: userId,
            name: sound.name,
            sound_url: finalSoundUrl,
            price: parseFloat(sound.price) || 2000.00,
            is_active: sound.is_active !== undefined ? Boolean(sound.is_active) : true
          }
        });
      }
    }

    const updatedSounds = await prisma.soundboardItem.findMany({
      where: { streamer_id: userId },
      orderBy: { createdAt: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: updatedSounds
    });
  } catch (error) {
    console.error('[updateSoundboardSettings Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.registerWhatsappAlarm = async (req, res) => {
  try {
    const { username } = req.params;
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Nomor telepon wajib diisi.' });
    }

    const prisma = require('../config/prisma');
    const streamer = await prisma.user.findUnique({ where: { username } });
    if (!streamer) {
      return res.status(404).json({ success: false, message: 'Kreator tidak ditemukan.' });
    }

    // Clean phone number: remove any non-digit chars
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

    await prisma.whatsappAlarmSubscription.upsert({
      where: {
        streamerId_phoneNumber: {
          streamerId: streamer.id,
          phoneNumber: cleanPhone
        }
      },
      update: {},
      create: {
        streamerId: streamer.id,
        phoneNumber: cleanPhone
      }
    });

    res.status(200).json({
      success: true,
      message: 'Alarm WhatsApp berhasil diaktifkan!'
    });
  } catch (error) {
    console.error('Error registering whatsapp alarm:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const maskName = (name) => {
  if (!name) return 'Anonymous';
  const trimmed = name.trim();
  if (trimmed.toLowerCase() === 'anonymous') return 'Anonymous';
  if (trimmed.length <= 3) return `${trimmed}***`;
  return `${trimmed.substring(0, 3)}***`;
};

exports.getRecentFeed = async (req, res) => {
  try {
    const prisma = require('../config/prisma');
    const transactions = await prisma.transaction.findMany({
      where: { status: 'SUCCESS' },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        streamer: {
          select: {
            username: true,
            avatar_url: true
          }
        }
      }
    });

    const feed = transactions.map(t => ({
      id: t.id,
      sender_name: maskName(t.sender_name),
      amount: parseFloat(t.gross_amount),
      type: t.type,
      streamer_username: t.streamer?.username || 'creator',
      streamer_avatar: t.streamer?.avatar_url || null,
      createdAt: t.createdAt
    }));

    res.status(200).json({ success: true, data: feed });
  } catch (error) {
    console.error('Error fetching recent transaction feed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


