const prisma = require('../config/prisma');

/**
 * Service for Mabar Queue management
 */
class QueueService {
  /**
   * Mengambil antrean aktif streamer (WAITING & PLAYING)
   */
  async getActiveQueues(streamerId) {
    return await prisma.mabarQueue.findMany({
      where: {
        transaction: {
          streamer_id: streamerId
        },
        status: {
          in: ['WAITING', 'PLAYING', 'SKIPPED']
        }
      },
      include: {
        transaction: true,
        game_package: true
      },
      orderBy: {
        createdAt: 'asc' // FIFO
      }
    });
  }

  /**
   * Membuat antrean baru (biasanya dipanggil setelah mabar sukses dibayar)
   */
  async createQueueEntry(transactionId, packageId, nickname, ingameId) {
    return await prisma.mabarQueue.create({
      data: {
        transaction_id: transactionId,
        package_id: packageId,
        ingame_nickname: nickname,
        ingame_id: ingameId,
        status: 'WAITING'
      }
    });
  }

  /**
   * Update status antrean (WAITING -> PLAYING -> DONE/SKIPPED)
   */
  async updateStatus(queueId, status) {
    return await prisma.mabarQueue.update({
      where: { id: queueId },
      data: { status }
    });
  }
}

module.exports = new QueueService();
