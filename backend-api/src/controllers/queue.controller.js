const queueService = require('../services/queue.service');
const { getIO } = require('../config/socket');

exports.getStreamerQueue = async (req, res) => {
  try {
    const { streamerId } = req.query;
    const queue = await queueService.getActiveQueues(streamerId);
    res.status(200).json({ success: true, data: queue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateQueueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // 1. Get queue item securely to find associated transaction & streamer ID
    const prisma = require('../config/prisma');
    const queueItem = await prisma.mabarQueue.findUnique({
      where: { id },
      include: { transaction: true }
    });
    
    if (!queueItem) {
      return res.status(404).json({ success: false, message: 'Antrean tidak ditemukan' });
    }
    
    const streamer_id = queueItem.transaction.streamer_id;
    
    // 2. Verify that the logged in user is actually this queue's streamer
    if (req.user.id !== streamer_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Anda bukan pemilik antrean ini' });
    }
    
    let updated;
    let customMessage = `Status antrean diperbarui ke ${status}`;

    if (status === 'DONE' && queueItem.slots_count > 1) {
      const newSlots = queueItem.slots_count - 1;
      updated = await prisma.mabarQueue.update({
        where: { id },
        data: {
          slots_count: newSlots
        }
      });
      customMessage = `Match selesai! Slot untuk ${queueItem.ingame_nickname} berkurang 1 (Sisa: ${newSlots} Match)`;
    } else if (status === 'DONE' && queueItem.slots_count <= 1) {
      updated = await prisma.mabarQueue.update({
        where: { id },
        data: {
          status: 'DONE',
          slots_count: 0
        }
      });
      customMessage = `Semua slot mabar untuk ${queueItem.ingame_nickname} telah sukses diselesaikan!`;
    } else if (status === 'SKIPPED' && queueItem.status === 'PLAYING') {
      // If actively playing and skipped, send them back to WAITING list keeping remaining slots
      updated = await prisma.mabarQueue.update({
        where: { id },
        data: {
          status: 'WAITING'
        }
      });
      customMessage = `${queueItem.ingame_nickname} dilewati sementara & dikembalikan ke daftar tunggu (Sisa: ${queueItem.slots_count} Sesi)`;
    } else {
      updated = await queueService.updateStatus(id, status);
    }
    
    // Broadcast update ke dashboard/widget
    const io = getIO();
    const updatedQueue = await queueService.getActiveQueues(streamer_id);
    io.to(streamer_id).emit('queue:update', updatedQueue);
    
    res.status(200).json({ success: true, message: customMessage, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getTickerQueue = async (req, res) => {
  try {
    const { token } = req.params;
    const prisma = require('../config/prisma');
    
    const streamer = await prisma.user.findFirst({
      where: { widget_token: token }
    });
    
    if (!streamer) {
      return res.status(404).json({ success: false, message: 'Token widget tidak valid.' });
    }
    
    const activeQueues = await prisma.mabarQueue.findMany({
      where: {
        transaction: {
          streamer_id: streamer.id
        },
        status: {
          in: ['PLAYING', 'WAITING']
        }
      },
      include: {
        game_package: true,
        transaction: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    const playingItems = activeQueues.filter(item => item.status === 'PLAYING');
    const waitingItems = activeQueues.filter(item => item.status === 'WAITING');
    
    const playing = playingItems.map(item => ({
      name: item.transaction.sender_name,
      game: item.game_package.game_name,
      ingame_nickname: item.ingame_nickname + (item.slots_count > 1 ? ` (${item.slots_count} Slots)` : '')
    }));
    
    const queue = waitingItems.map((item, idx) => ({
      name: item.transaction.sender_name,
      ingame_nickname: item.ingame_nickname + (item.slots_count > 1 ? ` (${item.slots_count} Slots)` : ''),
      position: idx + 1
    }));
    
    res.status(200).json({
      success: true,
      playing,
      queue,
      total_waiting: queue.length
    });
  } catch (error) {
    console.error('[Queue Ticker Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBulkQueueStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ID antrean tidak valid atau kosong' });
    }

    const prisma = require('../config/prisma');

    // 1. Fetch all items securely to verify ownership
    const queueItems = await prisma.mabarQueue.findMany({
      where: { id: { in: ids } },
      include: { transaction: true }
    });

    if (queueItems.length === 0) {
      return res.status(404).json({ success: false, message: 'Tidak ada antrean yang ditemukan' });
    }

    // Verify streamer ownership
    const streamerId = req.user.id;
    const unauthorized = queueItems.some(item => item.transaction.streamer_id !== streamerId);
    if (unauthorized) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Anda bukan pemilik salah satu antrean ini' });
    }

    const queueService = require('../services/queue.service');

    // 2. Process status changes iteratively
    let processedCount = 0;
    for (const item of queueItems) {
      if (status === 'DONE' && item.slots_count > 1) {
        await prisma.mabarQueue.update({
          where: { id: item.id },
          data: { slots_count: item.slots_count - 1 }
        });
      } else if (status === 'DONE' && item.slots_count <= 1) {
        await prisma.mabarQueue.update({
          where: { id: item.id },
          data: { status: 'DONE', slots_count: 0 }
        });
      } else if (status === 'SKIPPED' && item.status === 'PLAYING') {
        await prisma.mabarQueue.update({
          where: { id: item.id },
          data: { status: 'WAITING' }
        });
      } else {
        await queueService.updateStatus(item.id, status);
      }
      processedCount++;
    }

    // 3. Broadcast updated queue
    const io = getIO();
    const updatedQueue = await queueService.getActiveQueues(streamerId);
    io.to(streamerId).emit('queue:update', updatedQueue);

    let bulkMessage = `${processedCount} antrean berhasil diperbarui.`;
    if (status === 'WAITING') {
      bulkMessage = `${processedCount} antrean berhasil di-up / diaktifkan kembali!`;
    } else if (status === 'SKIPPED') {
      bulkMessage = `${processedCount} antrean berhasil dilewati!`;
    } else if (status === 'DONE') {
      bulkMessage = `${processedCount} antrean berhasil diselesaikan!`;
    }

    res.status(200).json({ success: true, message: bulkMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.callQueueMember = async (req, res) => {
  try {
    const { id } = req.params;
    const prisma = require('../config/prisma');

    // 1. Fetch queue item securely to verify ownership and extract game details
    const queueItem = await prisma.mabarQueue.findUnique({
      where: { id },
      include: {
        transaction: true,
        game_package: true
      }
    });

    if (!queueItem) {
      return res.status(404).json({ success: false, message: 'Antrean tidak ditemukan' });
    }

    const streamer_id = queueItem.transaction.streamer_id;

    // 2. Verify that the logged in user is actually this queue's streamer
    if (req.user.id !== streamer_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Anda bukan pemilik antrean ini' });
    }

    // 3. Emit special calling alert to the streamer's alert room
    const io = getIO();
    io.to(`alert:${streamer_id}`).emit('alert:queue-call', {
      id: queueItem.id,
      sender_name: queueItem.transaction.sender_name,
      gross_amount: queueItem.transaction.gross_amount,
      ingame_nickname: queueItem.ingame_nickname,
      ingame_id: queueItem.ingame_id,
      game_name: queueItem.game_package.game_name,
      slots_count: queueItem.slots_count,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: `Panggilan suara untuk ${queueItem.ingame_nickname} berhasil dikirim ke overlay live!`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

