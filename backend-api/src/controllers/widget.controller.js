const widgetService = require('../services/widget.service');
const path = require('path');
const fs = require('fs');

// GET /api/v1/widget-settings — kreator ambil setting sendiri (auth required)
exports.getMySettings = async (req, res) => {
  try {
    const setting = await widgetService.getOrCreate(req.user.id);
    res.json({ success: true, data: setting });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/v1/widget-settings — kreator simpan setting (auth required)
exports.updateSettings = async (req, res) => {
  try {
    const updated = await widgetService.update(req.user.id, req.body);
    
    // Emit real-time update to public profile page
    try {
      const { getIO } = require('../config/socket');
      const io = getIO();
      io.to(req.user.id).emit('profile:updated', { userId: req.user.id });
      console.log(`[Socket] profile:updated (widget settings) emitted for user ${req.user.id}`);
    } catch (socketErr) {
      console.warn('[Socket] Failed to emit:', socketErr.message);
    }
    
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/widget-settings/public/:token — overlay OBS ambil setting tanpa auth
exports.getPublicSettings = async (req, res) => {
  try {
    const setting = await widgetService.getByToken(req.params.token);
    if (!setting) return res.status(404).json({ success: false, message: 'Token tidak valid.' });
    res.json({ success: true, data: setting });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/widget-settings/upload-sound — upload custom sound file
exports.uploadSound = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload.' });
    const fileUrl = `/uploads/sounds/${req.file.filename}`;
    res.json({ success: true, url: fileUrl, filename: req.file.filename });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/widget-settings/upload-gif — upload custom GIF file
exports.uploadGif = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload.' });
    const fileUrl = `/uploads/gifs/${req.file.filename}`;
    res.json({ success: true, url: fileUrl, filename: req.file.filename });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/widget-settings/test-alert — kirim test alert ke overlay via socket
exports.testAlert = async (req, res) => {
  try {
    const { getIO } = require('../config/socket');
    const io = getIO();
    const streamerId = req.user.id;
    const { type, sender_name, gross_amount, message, game_name, donation_media, mediashare_url } = req.body;

    const isVideoMedia = donation_media && ['YOUTUBE', 'TIKTOK', 'REELS'].includes(donation_media.media_type);

    if (type === 'MEDIASHARE' || isVideoMedia) {
      const mediaUrl = mediashare_url || (donation_media ? donation_media.media_url : 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      const payload = {
        id: `test-media-${Date.now()}`,
        sender_name: sender_name || 'Test User',
        gross_amount: gross_amount || 50000,
        message: message || 'Test mediashare!',
        mediashare_url: mediaUrl,
        donation_media: donation_media || null,
        timestamp: new Date().toISOString()
      };

      io.to(streamerId).emit('alert:mediashare', payload);
      io.to(`mediashare:${streamerId}`).emit('alert:mediashare', payload);
      console.log(`[Widget] Test mediashare alert dikirim ke room ${streamerId}`);
    } else {
      const eventName = type === 'MABAR' ? 'alert:mabar' : 'alert:donation';
      const payload = {
        id: `test-${type.toLowerCase()}-${Date.now()}`,
        sender_name: sender_name || 'Test User',
        gross_amount: gross_amount || 50000,
        message: message || 'Ini adalah test alert!',
        game_name: game_name || '',
        ingame_nickname: sender_name || 'TreetmiPlayer',
        ingame_id: '987654321 (Server Asia)',
        donation_media: donation_media || null,
        timestamp: new Date().toISOString()
      };

      io.to(streamerId).emit(eventName, payload);
      io.to(`alert:${streamerId}`).emit(eventName, payload);
      console.log(`[Widget] Test alert ${type} dikirim ke room ${streamerId}`);
    }

    res.json({ success: true, message: 'Test alert berhasil dikirim ke overlay!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
