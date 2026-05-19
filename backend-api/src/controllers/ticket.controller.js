const prisma = require('../config/prisma');

/**
 * Create a new Support Ticket
 */
exports.createTicket = async (req, res) => {
  try {
    const streamer_id = req.user.id;
    const { category, subject, description } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'Subject dan deskripsi wajib diisi.' });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        streamer_id,
        category: category || 'OTHER',
        subject,
        description,
        status: 'OPEN'
      }
    });

    res.status(201).json({ success: true, message: 'Tiket berhasil dibuat.', data: ticket });
  } catch (error) {
    console.error('[Ticket Controller Create Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all Support Tickets of a Streamer
 */
exports.getTickets = async (req, res) => {
  try {
    const streamer_id = req.user.id;
    const tickets = await prisma.supportTicket.findMany({
      where: { streamer_id },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    console.error('[Ticket Controller Get Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Superadmin: Get all Support Tickets in the system
 */
exports.adminGetAllTickets = async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      include: {
        streamer: {
          select: {
            username: true,
            email: true,
            avatar_url: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    console.error('[Ticket Admin Get Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Superadmin: Respond or update status of a support ticket
 */
exports.adminRespondTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_reply } = req.body;

    const existing = await prisma.supportTicket.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Tiket tidak ditemukan.' });
    }

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: {
        status: status || existing.status,
        admin_reply: admin_reply !== undefined ? admin_reply : existing.admin_reply
      }
    });

    res.status(200).json({ success: true, message: 'Tiket berhasil diperbarui.', data: updated });
  } catch (error) {
    console.error('[Ticket Admin Respond Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
