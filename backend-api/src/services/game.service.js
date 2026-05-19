const prisma = require('../config/prisma');

/**
 * Service for Game Package management
 */
class GameService {
  async createPackage(streamerId, data) {
    const isNewActive = data.status === 'ACTIVE' || !data.status;
    if (isNewActive) {
      await prisma.gamePackage.updateMany({
        where: { streamer_id: streamerId, status: { in: ['ACTIVE', 'INACTIVE'] } },
        data: { status: 'INACTIVE' }
      });
    }
    return await prisma.gamePackage.create({
      data: {
        streamer_id: streamerId,
        game_name: data.game_name,
        price_per_slot: data.price_per_slot,
        status: data.status || 'ACTIVE'
      }
    });
  }

  async getPackagesByStreamer(streamerId) {
    return await prisma.gamePackage.findMany({
      where: { streamer_id: streamerId, status: { in: ['ACTIVE', 'INACTIVE'] } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updatePackage(id, data) {
    if (data.status === 'ACTIVE') {
      const existing = await prisma.gamePackage.findUnique({
        where: { id }
      });
      if (existing) {
        await prisma.gamePackage.updateMany({
          where: { 
            streamer_id: existing.streamer_id,
            id: { not: id }
          },
          data: { status: 'INACTIVE' }
        });
      }
    }

    return await prisma.gamePackage.update({
      where: { id },
      data: {
        game_name: data.game_name,
        price_per_slot: data.price_per_slot,
        status: data.status
      }
    });
  }

  async deletePackage(id) {
    return await prisma.gamePackage.update({
      where: { id },
      data: { status: 'DELETED' }
    });
  }
}

module.exports = new GameService();
