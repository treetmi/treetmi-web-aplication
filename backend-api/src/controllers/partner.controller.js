const prisma = require('../config/prisma');
const fs = require('fs');
const path = require('path');

// 1. Get active partners for public footer
async function getPublicPartners(req, res) {
  try {
    const partners = await prisma.partner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
    return res.status(200).json({
      success: true,
      data: partners
    });
  } catch (error) {
    console.error('Error fetching public partners:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data partner.'
    });
  }
}

// 2. Get all partners for superadmin dashboard
async function getAdminPartners(req, res) {
  try {
    const partners = await prisma.partner.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    return res.status(200).json({
      success: true,
      data: partners
    });
  } catch (error) {
    console.error('Error fetching admin partners:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data partner admin.'
    });
  }
}

// 3. Create a new partner
async function createPartner(req, res) {
  try {
    const { name, link_url, order, isActive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nama partner wajib diisi.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Logo atau icon partner wajib diunggah.'
      });
    }

    let logoUrl = `/uploads/partners/${req.file.filename}`;
    const { uploadToR2 } = require('../config/r2');
    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      const r2Url = await uploadToR2(fileBuffer, req.file.filename, req.file.mimetype, 'partners');
      if (r2Url) {
        logoUrl = r2Url;
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkErr) {
          console.error('Failed to delete temp local file:', unlinkErr);
        }
      }
    } catch (r2Err) {
      console.error('Failed to upload partner logo to R2, falling back to local storage:', r2Err);
    }

    const parsedOrder = order ? parseInt(order, 10) : 0;
    const active = isActive === 'false' ? false : true;

    const partner = await prisma.partner.create({
      data: {
        name: name.trim(),
        logo_url: logoUrl,
        link_url: link_url ? link_url.trim() : null,
        order: parsedOrder,
        isActive: active
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Partner berhasil ditambahkan.',
      data: partner
    });
  } catch (error) {
    console.error('Error creating partner:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan partner.'
    });
  }
}

// 4. Update an existing partner
async function updatePartner(req, res) {
  try {
    const { id } = req.params;
    const { name, link_url, order, isActive } = req.body;

    const existingPartner = await prisma.partner.findUnique({
      where: { id }
    });

    if (!existingPartner) {
      return res.status(444).json({
        success: false,
        message: 'Partner tidak ditemukan.'
      });
    }

    let logoUrl = existingPartner.logo_url;
    if (req.file) {
      const { uploadToR2, deleteFromR2 } = require('../config/r2');
      let isUploadedToCloud = false;
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const r2Url = await uploadToR2(fileBuffer, req.file.filename, req.file.mimetype, 'partners');
        if (r2Url) {
          // Delete old asset
          if (existingPartner.logo_url.startsWith('http')) {
            await deleteFromR2(existingPartner.logo_url);
          } else {
            const oldPath = path.join(__dirname, '../../', existingPartner.logo_url);
            if (fs.existsSync(oldPath)) {
              try {
                fs.unlinkSync(oldPath);
              } catch (e) {
                console.warn('Failed to delete old logo file:', e);
              }
            }
          }
          logoUrl = r2Url;
          isUploadedToCloud = true;
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkErr) {
            console.error('Failed to delete temp local file:', unlinkErr);
          }
        }
      } catch (r2Err) {
        console.error('Failed to upload partner logo to R2:', r2Err);
      }

      if (!isUploadedToCloud) {
        // Local fallback
        if (existingPartner.logo_url.startsWith('http')) {
          await deleteFromR2(existingPartner.logo_url);
        } else {
          const oldPath = path.join(__dirname, '../../', existingPartner.logo_url);
          if (fs.existsSync(oldPath)) {
            try {
              fs.unlinkSync(oldPath);
            } catch (e) {
              console.warn('Failed to delete old logo file:', e);
            }
          }
        }
        logoUrl = `/uploads/partners/${req.file.filename}`;
      }
    }

    const parsedOrder = order !== undefined ? parseInt(order, 10) : existingPartner.order;
    const active = isActive !== undefined ? (isActive === 'false' ? false : true) : existingPartner.isActive;

    const updated = await prisma.partner.update({
      where: { id },
      data: {
        name: name ? name.trim() : existingPartner.name,
        logo_url: logoUrl,
        link_url: link_url !== undefined ? (link_url ? link_url.trim() : null) : existingPartner.link_url,
        order: parsedOrder,
        isActive: active
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Partner berhasil diperbarui.',
      data: updated
    });
  } catch (error) {
    console.error('Error updating partner:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui partner.'
    });
  }
}

// 5. Toggle partner active status
async function togglePartner(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.partner.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Partner tidak ditemukan.'
      });
    }

    const updated = await prisma.partner.update({
      where: { id },
      data: {
        isActive: !existing.isActive
      }
    });

    return res.status(200).json({
      success: true,
      message: `Partner berhasil ${updated.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`,
      data: updated
    });
  } catch (error) {
    console.error('Error toggling partner status:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengubah status partner.'
    });
  }
}

// 6. Delete a partner
async function deletePartner(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.partner.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Partner tidak ditemukan.'
      });
    }

    // Delete logo file
    if (existing.logo_url && existing.logo_url.startsWith('http')) {
      const { deleteFromR2 } = require('../config/r2');
      try {
        await deleteFromR2(existing.logo_url);
      } catch (e) {
        console.warn('Failed to delete old logo from R2 during deletion:', e);
      }
    } else if (existing.logo_url) {
      const logoPath = path.join(__dirname, '../../', existing.logo_url);
      if (fs.existsSync(logoPath)) {
        try {
          fs.unlinkSync(logoPath);
        } catch (e) {
          console.warn('Failed to delete logo file during deletion:', e);
        }
      }
    }

    await prisma.partner.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Partner berhasil dihapus.'
    });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus partner.'
    });
  }
}

module.exports = {
  getPublicPartners,
  getAdminPartners,
  createPartner,
  updatePartner,
  togglePartner,
  deletePartner
};
