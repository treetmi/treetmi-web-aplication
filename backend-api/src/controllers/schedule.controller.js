const prisma = require('../config/prisma');

/**
 * Public: Get active schedules of a creator by username
 */
exports.getPublicSchedules = async (req, res) => {
  try {
    const { username } = req.params;

    const creator = await prisma.user.findUnique({
      where: { username }
    });

    if (!creator) {
      return res.status(404).json({ success: false, message: 'Kreator tidak ditemukan.' });
    }

    const schedules = await prisma.liveSchedule.findMany({
      where: {
        streamer_id: creator.id,
        is_active: true
      },
      orderBy: { date: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: schedules,
      schedule_title: creator.schedule_title || 'Jadwal Live Streaming'
    });
  } catch (error) {
    console.error('[Schedule Controller Public Get Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Private: Get all schedules of the logged-in streamer
 */
exports.getPrivateSchedules = async (req, res) => {
  try {
    const streamer_id = req.user.id;

    const schedules = await prisma.liveSchedule.findMany({
      where: { streamer_id },
      orderBy: { date: 'asc' }
    });

    res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    console.error('[Schedule Controller Private Get Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Private: Create a new Live Schedule
 */
exports.createSchedule = async (req, res) => {
  try {
    const streamer_id = req.user.id;
    const { title, category, date, description, is_active } = req.body;

    if (!title || !category || !date) {
      return res.status(400).json({ success: false, message: 'Judul, Kategori, dan Tanggal wajib diisi.' });
    }

    const schedule = await prisma.liveSchedule.create({
      data: {
        streamer_id,
        title,
        category,
        date: new Date(date),
        description,
        is_active: is_active !== undefined ? is_active : true
      }
    });

    try {
      const { getIO } = require('../config/socket');
      getIO().to(streamer_id).emit('profile:updated', { userId: streamer_id });
    } catch (e) {}

    res.status(201).json({ success: true, message: 'Jadwal live berhasil dibuat.', data: schedule });
  } catch (error) {
    console.error('[Schedule Controller Create Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Private: Edit an existing Live Schedule
 */
exports.editSchedule = async (req, res) => {
  try {
    const streamer_id = req.user.id;
    const { id } = req.params;
    const { title, category, date, description, is_active } = req.body;

    const existing = await prisma.liveSchedule.findFirst({
      where: { id, streamer_id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan.' });
    }

    const updated = await prisma.liveSchedule.update({
      where: { id },
      data: {
        title: title || existing.title,
        category: category || existing.category,
        date: date ? new Date(date) : existing.date,
        description: description !== undefined ? description : existing.description,
        is_active: is_active !== undefined ? is_active : existing.is_active
      }
    });

    try {
      const { getIO } = require('../config/socket');
      getIO().to(streamer_id).emit('profile:updated', { userId: streamer_id });
    } catch (e) {}

    res.status(200).json({ success: true, message: 'Jadwal live berhasil diperbarui.', data: updated });
  } catch (error) {
    console.error('[Schedule Controller Edit Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Private: Delete a Live Schedule
 */
exports.deleteSchedule = async (req, res) => {
  try {
    const streamer_id = req.user.id;
    const { id } = req.params;

    const existing = await prisma.liveSchedule.findFirst({
      where: { id, streamer_id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan.' });
    }

    await prisma.liveSchedule.delete({
      where: { id }
    });

    try {
      const { getIO } = require('../config/socket');
      getIO().to(streamer_id).emit('profile:updated', { userId: streamer_id });
    } catch (e) {}

    res.status(200).json({ success: true, message: 'Jadwal live berhasil dihapus.' });
  } catch (error) {
    console.error('[Schedule Controller Delete Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
