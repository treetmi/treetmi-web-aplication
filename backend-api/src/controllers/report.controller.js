const prisma = require('../config/prisma');
const fs = require('fs');
const path = require('path');
const { uploadToR2 } = require('../config/r2');

/**
 * Helper to send embed message to Discord Webhook
 */
async function sendDiscordReportAlert(report, screenshotUrl, settings) {
  const webhookUrl = settings?.discordReportWebhook;
  if (!webhookUrl || webhookUrl.trim() === '') {
    return;
  }

  // Determine Embed Color based on Category
  // SCAM & HARASSMENT = Red (15073357), DONATION = Orange (16102148), Others = Blue (3884278)
  let color = 3884278; // Default blue
  if (report.category === 'SCAM' || report.category === 'HARASSMENT') {
    color = 15073357; // Red
  } else if (report.category === 'DONATION') {
    color = 16102148; // Orange
  }

  const embedPayload = {
    username: 'Treetmi Security Desk',
    avatar_url: 'https://treetmi.id/favicon.png',
    embeds: [
      {
        title: '🚨 LAPORAN KREATOR BARU MASUK',
        description: `Ada keluhan/laporan baru dari pengguna terhadap kreator di platform.`,
        color: color,
        fields: [
          {
            name: '👤 Pelapor',
            value: `Nama: ${report.reporter_name || 'Anonim'}\nEmail: ${report.reporter_email}`,
            inline: true
          },
          {
            name: '🎯 Terlapor (Kreator)',
            value: `@${report.target_username || 'Tidak Disebutkan'}`,
            inline: true
          },
          {
            name: '📁 Kategori Laporan',
            value: report.category,
            inline: true
          },
          {
            name: '📝 Rincian Aduan',
            value: report.details || 'Tidak ada detail tambahan.'
          }
        ],
        image: {
          url: screenshotUrl
        },
        timestamp: new Date().toISOString(),
        footer: {
          text: `ID Laporan: ${report.id} • Treetmi Security`
        }
      }
    ]
  };

  try {
    // Check if global fetch is available (Node 18+)
    if (typeof fetch !== 'undefined') {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(embedPayload)
      });
    } else {
      // Fallback to HTTPS module
      const https = require('https');
      const url = new URL(webhookUrl);
      const dataString = JSON.stringify(embedPayload);

      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': dataString.length
        }
      };

      const req = https.request(options);
      req.write(dataString);
      req.end();
    }
  } catch (err) {
    console.error('Failed to send Discord Webhook notification:', err.message);
  }
}

/**
 * Public: Create a new User Report (Screenshot proof is mandatory)
 */
exports.createReport = async (req, res) => {
  try {
    const { reporter_email, reporter_name, target_username, category, details } = req.body;

    if (!reporter_email) {
      return res.status(400).json({ success: false, message: 'Email pelapor wajib diisi.' });
    }

    if (!details || details.trim() === '') {
      return res.status(400).json({ success: false, message: 'Rincian keluhan wajib diisi.' });
    }

    // MANDATORY Screenshot Check
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bukti screenshot laporan wajib diunggah untuk keperluan validasi admin.' 
      });
    }

    // Find target user (creator) by username if provided
    let target_user_id = null;
    let target_username_clean = null;
    if (target_username) {
      target_username_clean = target_username.trim().replace('@', '');
      const creator = await prisma.user.findFirst({
        where: {
          username: {
            equals: target_username_clean,
            mode: 'insensitive'
          }
        }
      });
      if (creator) {
        target_user_id = creator.id;
        target_username_clean = creator.username; // Use canonical casing
      }
    }

    // Handle Upload file to Cloudflare R2 (or fallback to local)
    let screenshotUrl = `${req.protocol}://${req.get('host')}/uploads/reports/${req.file.filename}`;
    let isCloudUploaded = false;

    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      const r2Url = await uploadToR2(fileBuffer, req.file.filename, req.file.mimetype, 'reports');
      if (r2Url) {
        screenshotUrl = r2Url;
        isCloudUploaded = true;
        // Clean up temporary local file
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkErr) {
          console.error('Failed to delete temp local report file:', unlinkErr);
        }
      }
    } catch (r2Err) {
      console.warn('R2 upload failed for report, fallback to local storage:', r2Err.message);
    }

    // Save to Database
    const report = await prisma.userReport.create({
      data: {
        reporter_email,
        reporter_name: reporter_name || null,
        target_user_id,
        target_username: target_username_clean,
        category: category || 'OTHER',
        details: details.trim(),
        screenshot_url: screenshotUrl,
        status: 'PENDING'
      }
    });

    // Send Alert to Discord Webhook dynamically
    const settings = await prisma.siteSetting.findFirst();
    if (settings) {
      // Trigger discord alert asynchronously
      sendDiscordReportAlert(report, screenshotUrl, settings).catch(err => {
        console.error('Discord webhook alert failed:', err);
      });
    }

    res.status(201).json({
      success: true,
      message: 'Laporan Anda berhasil terkirim. Tim Keamanan Treetmi akan segera memvalidasi dan memproses aduan Anda.',
      data: report
    });

  } catch (error) {
    console.error('[Report Controller Create Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Get all User Reports
 */
exports.adminGetAllReports = async (req, res) => {
  try {
    const reports = await prisma.userReport.findMany({
      include: {
        target_user: {
          select: {
            username: true,
            avatar_url: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    console.error('[Report Controller Admin Get Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Respond and update status of a report
 */
exports.adminUpdateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const existing = await prisma.userReport.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan.' });
    }

    const updated = await prisma.userReport.update({
      where: { id },
      data: {
        status: status || existing.status,
        admin_notes: admin_notes !== undefined ? admin_notes : existing.admin_notes
      }
    });

    res.status(200).json({
      success: true,
      message: 'Status aduan berhasil diperbarui.',
      data: updated
    });
  } catch (error) {
    console.error('[Report Controller Admin Update Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
