'use strict';

const prisma = require('../config/prisma');

/**
 * Helper: Process base64 GIF upload (reuse pattern from admin.controller)
 */
async function processGifUpload(base64Url, name) {
  if (!base64Url || !base64Url.startsWith('data:')) {
    return base64Url;
  }
  try {
    const { uploadToR2 } = require('../config/r2');
    const matches = base64Url.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return base64Url;

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const filename = `gift-${cleanName}-${Date.now()}.gif`;
    const r2Url = await uploadToR2(buffer, filename, mimeType, 'gifts');
    if (r2Url) return r2Url;
  } catch (error) {
    console.error('[Gift R2 Upload] Failed:', error);
  }
  return base64Url;
}

// ============================================================
// SUPERADMIN: CRUD SystemGift
// ============================================================

/**
 * GET /admin/gifts — Daftar semua Gift Global
 */
exports.adminGetAllGifts = async (req, res) => {
  try {
    const gifts = await prisma.systemGift.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: gifts });
  } catch (err) {
    console.error('[adminGetAllGifts]', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data gift.' });
  }
};

/**
 * POST /admin/gifts — Tambah Gift Global baru
 */
exports.adminCreateGift = async (req, res) => {
  try {
    const { name, url, price, isActive } = req.body;

    if (!name || !url || price === undefined) {
      return res.status(400).json({ success: false, message: 'Nama, file GIF, dan harga wajib diisi!' });
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ success: false, message: 'Harga harus berupa angka non-negatif.' });
    }

    // Validate GIF size if base64
    if (url.startsWith('data:')) {
      const approxBytes = (url.length * 3) / 4;
      if (approxBytes > 2 * 1024 * 1024) {
        return res.status(400).json({ success: false, message: 'Ukuran file GIF tidak boleh melebihi 2 MB.' });
      }
    }

    const finalUrl = await processGifUpload(url.trim(), name.trim());

    const gift = await prisma.systemGift.create({
      data: {
        name: name.trim(),
        url: finalUrl,
        price: priceNum,
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    });

    res.status(201).json({ success: true, message: 'Gift baru berhasil ditambahkan!', data: gift });
  } catch (err) {
    console.error('[adminCreateGift]', err);
    res.status(500).json({ success: false, message: 'Gagal menambahkan gift.' });
  }
};

/**
 * PUT /admin/gifts/:id — Update Gift Global
 */
exports.adminUpdateGift = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, price, isActive } = req.body;

    const existing = await prisma.systemGift.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Gift tidak ditemukan.' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (price !== undefined) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({ success: false, message: 'Harga harus berupa angka non-negatif.' });
      }
      updateData.price = priceNum;
    }
    if (url !== undefined) {
      // Validate size if base64
      if (url.startsWith('data:')) {
        const approxBytes = (url.length * 3) / 4;
        if (approxBytes > 2 * 1024 * 1024) {
          return res.status(400).json({ success: false, message: 'Ukuran file GIF tidak boleh melebihi 2 MB.' });
        }
      }
      updateData.url = await processGifUpload(url.trim(), (name || existing.name).trim());
    }

    const updated = await prisma.systemGift.update({ where: { id }, data: updateData });
    res.status(200).json({ success: true, message: 'Gift berhasil diperbarui!', data: updated });
  } catch (err) {
    console.error('[adminUpdateGift]', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui gift.' });
  }
};

/**
 * DELETE /admin/gifts/:id — Hapus Gift Global
 */
exports.adminDeleteGift = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.systemGift.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Gift tidak ditemukan.' });
    }

    // Try to clean up R2 storage
    const publicDomain = process.env.R2_PUBLIC_DOMAIN || 'https://cdn-storage.treetmi.id';
    const cleanDomain = publicDomain.replace(/https?:\/\//, '');
    if (existing.url && existing.url.includes(cleanDomain)) {
      try {
        const { deleteFromR2 } = require('../config/r2');
        await deleteFromR2(existing.url);
      } catch (e) {
        console.error('[adminDeleteGift] R2 cleanup failed:', e);
      }
    }

    // Also delete all creator settings for this gift
    await prisma.creatorGiftSetting.deleteMany({ where: { giftId: id } });
    await prisma.systemGift.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Gift berhasil dihapus.' });
  } catch (err) {
    console.error('[adminDeleteGift]', err);
    res.status(500).json({ success: false, message: 'Gagal menghapus gift.' });
  }
};

// ============================================================
// CREATOR: Kelola toggle gift di channel mereka
// ============================================================

/**
 * GET /users/my-gifts — Daftar semua gift global beserta status toggle kreator
 */
exports.creatorGetGiftSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all active global gifts
    const allGifts = await prisma.systemGift.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });

    // Get this creator's toggle settings
    const creatorSettings = await prisma.creatorGiftSetting.findMany({
      where: { userId }
    });

    const settingsMap = {};
    creatorSettings.forEach(s => { settingsMap[s.giftId] = s.isEnabled; });

    // Merge: default isEnabled = true if not configured yet
    const merged = allGifts.map(gift => ({
      ...gift,
      price: parseFloat(gift.price),
      isEnabled: settingsMap[gift.id] !== undefined ? settingsMap[gift.id] : true
    }));

    res.status(200).json({ success: true, data: merged });
  } catch (err) {
    console.error('[creatorGetGiftSettings]', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil pengaturan gift.' });
  }
};

/**
 * PUT /users/my-gifts/:giftId — Toggle aktif/nonaktif gift di channel kreator
 */
exports.creatorToggleGift = async (req, res) => {
  try {
    const userId = req.user.id;
    const { giftId } = req.params;
    const { isEnabled } = req.body;

    if (isEnabled === undefined) {
      return res.status(400).json({ success: false, message: 'Field isEnabled wajib disertakan.' });
    }

    // Verify gift exists and is active globally
    const gift = await prisma.systemGift.findUnique({ where: { id: giftId } });
    if (!gift || !gift.isActive) {
      return res.status(404).json({ success: false, message: 'Gift tidak ditemukan atau tidak aktif.' });
    }

    const setting = await prisma.creatorGiftSetting.upsert({
      where: { userId_giftId: { userId, giftId } },
      update: { isEnabled: Boolean(isEnabled) },
      create: { userId, giftId, isEnabled: Boolean(isEnabled) }
    });

    res.status(200).json({
      success: true,
      message: `Gift "${gift.name}" ${setting.isEnabled ? 'diaktifkan' : 'dinonaktifkan'} di channel Anda.`,
      data: setting
    });
  } catch (err) {
    console.error('[creatorToggleGift]', err);
    res.status(500).json({ success: false, message: 'Gagal mengubah pengaturan gift.' });
  }
};

// ============================================================
// PUBLIC: Daftar gift aktif untuk halaman donasi
// ============================================================

/**
 * GET /public/gifts/:username — Gift yang aktif untuk channel kreator tertentu
 */
exports.publicGetActiveGifts = async (req, res) => {
  try {
    const { username } = req.params;

    // Find creator
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kreator tidak ditemukan.' });
    }

    const mediaSettings = await prisma.creatorMediaSetting.findUnique({
      where: { streamer_id: user.id }
    });
    if (mediaSettings && (!mediaSettings.global_toggle || !mediaSettings.gift_toggle)) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Get all globally active gifts
    const allGifts = await prisma.systemGift.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });

    // Get creator's disabled gifts
    const disabledSettings = await prisma.creatorGiftSetting.findMany({
      where: { userId: user.id, isEnabled: false }
    });
    const disabledGiftIds = new Set(disabledSettings.map(s => s.giftId));

    // Filter out creator-disabled gifts
    const activeGifts = allGifts
      .filter(gift => !disabledGiftIds.has(gift.id))
      .map(gift => ({
        id: gift.id,
        name: gift.name,
        url: gift.url,
        price: parseFloat(gift.price)
      }));

    res.status(200).json({ success: true, data: activeGifts });
  } catch (err) {
    console.error('[publicGetActiveGifts]', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar gift.' });
  }
};
