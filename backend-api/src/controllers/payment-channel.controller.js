const prisma = require('../config/prisma');
const fs = require('fs');
const path = require('path');

// 1. Get active channels for homepage & checkout
async function getPublicChannels(req, res) {
  try {
    const channels = await prisma.paymentChannel.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    
    // Map relative logoUrl to absolute URL if needed or keep relative
    const formatted = channels.map(c => ({
      ...c,
      minFee: parseFloat(c.minFee.toString())
    }));

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('Error fetching public payment channels:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data metode pembayaran.'
    });
  }
}

// 2. Get all channels for superadmin dashboard
async function getAdminChannels(req, res) {
  try {
    const channels = await prisma.paymentChannel.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const formatted = channels.map(c => ({
      ...c,
      minFee: parseFloat(c.minFee.toString())
    }));

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('Error fetching admin payment channels:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data metode pembayaran admin.'
    });
  }
}

// 3. Create a new payment channel
async function createPaymentChannel(req, res) {
  try {
    const { name, code, minFee, isActive } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Nama dan Kode Metode Pembayaran wajib diisi.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Logo atau icon metode pembayaran wajib diunggah.'
      });
    }

    const lowercaseCode = code.toLowerCase().trim();

    // Check unique code
    const existing = await prisma.paymentChannel.findUnique({
      where: { code: lowercaseCode }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Metode pembayaran dengan kode "${lowercaseCode}" sudah terdaftar.`
      });
    }

    const logoUrl = `/uploads/payment-logos/${req.file.filename}`;
    const parsedFee = minFee ? parseFloat(minFee) : 0.00;
    const active = isActive === 'false' ? false : true;

    const channel = await prisma.paymentChannel.create({
      data: {
        name: name.trim(),
        code: lowercaseCode,
        logoUrl,
        minFee: parsedFee,
        isActive: active
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Metode pembayaran berhasil ditambahkan.',
      data: {
        ...channel,
        minFee: parseFloat(channel.minFee.toString())
      }
    });
  } catch (error) {
    console.error('Error creating payment channel:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan metode pembayaran.'
    });
  }
}

// 4. Update an existing payment channel
async function updatePaymentChannel(req, res) {
  try {
    const { id } = req.params;
    const { name, code, minFee, isActive } = req.body;

    const existingChannel = await prisma.paymentChannel.findUnique({
      where: { id }
    });

    if (!existingChannel) {
      return res.status(444).json({
        success: false,
        message: 'Metode pembayaran tidak ditemukan.'
      });
    }

    const lowercaseCode = code ? code.toLowerCase().trim() : existingChannel.code;

    // Check unique code if changed
    if (code && lowercaseCode !== existingChannel.code) {
      const existing = await prisma.paymentChannel.findUnique({
        where: { code: lowercaseCode }
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Metode pembayaran dengan kode "${lowercaseCode}" sudah terdaftar.`
        });
      }
    }

    let logoUrl = existingChannel.logoUrl;
    if (req.file) {
      // Remove old logo if exists
      const oldPath = path.join(__dirname, '../../', existingChannel.logoUrl);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (e) {
          console.warn('Failed to delete old logo file:', e);
        }
      }
      logoUrl = `/uploads/payment-logos/${req.file.filename}`;
    }

    const parsedFee = minFee !== undefined ? parseFloat(minFee) : parseFloat(existingChannel.minFee.toString());
    const active = isActive !== undefined ? (isActive === 'false' ? false : true) : existingChannel.isActive;

    const updated = await prisma.paymentChannel.update({
      where: { id },
      data: {
        name: name ? name.trim() : existingChannel.name,
        code: lowercaseCode,
        logoUrl,
        minFee: parsedFee,
        isActive: active
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Metode pembayaran berhasil diperbarui.',
      data: {
        ...updated,
        minFee: parseFloat(updated.minFee.toString())
      }
    });
  } catch (error) {
    console.error('Error updating payment channel:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui metode pembayaran.'
    });
  }
}

// 5. Toggle active status instantly
async function togglePaymentChannel(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.paymentChannel.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Metode pembayaran tidak ditemukan.'
      });
    }

    const updated = await prisma.paymentChannel.update({
      where: { id },
      data: {
        isActive: !existing.isActive
      }
    });

    return res.status(200).json({
      success: true,
      message: `Metode pembayaran berhasil ${updated.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`,
      data: {
        ...updated,
        minFee: parseFloat(updated.minFee.toString())
      }
    });
  } catch (error) {
    console.error('Error toggling payment channel status:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengubah status metode pembayaran.'
    });
  }
}

// 6. Delete a payment channel
async function deletePaymentChannel(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.paymentChannel.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Metode pembayaran tidak ditemukan.'
      });
    }

    // Delete logo file
    const logoPath = path.join(__dirname, '../../', existing.logoUrl);
    if (fs.existsSync(logoPath)) {
      try {
        fs.unlinkSync(logoPath);
      } catch (e) {
        console.warn('Failed to delete logo file during deletion:', e);
      }
    }

    await prisma.paymentChannel.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Metode pembayaran berhasil dihapus.'
    });
  } catch (error) {
    console.error('Error deleting payment channel:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus metode pembayaran.'
    });
  }
}

module.exports = {
  getPublicChannels,
  getAdminChannels,
  createPaymentChannel,
  updatePaymentChannel,
  togglePaymentChannel,
  deletePaymentChannel
};
