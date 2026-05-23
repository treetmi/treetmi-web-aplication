const prisma = require('../config/prisma');

/**
 * Service to manage Creator Project Assets / Digital Rewards
 */
class ProjectService {
  /**
   * Create a new project reward asset
   */
  async createProject(streamerId, data) {
    return await prisma.projectAsset.create({
      data: {
        streamer_id: streamerId,
        title: data.title,
        description: data.description,
        file_url: data.file_url,
        min_support: Number(data.min_support)
      }
    });
  }

  /**
   * Update a project reward asset
   */
  async updateProject(id, data) {
    return await prisma.projectAsset.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        file_url: data.file_url,
        min_support: Number(data.min_support)
      }
    });
  }

  /**
   * Get all digital project assets of a specific creator
   */
  async getProjectsByStreamer(streamerId) {
    return await prisma.projectAsset.findMany({
      where: { streamer_id: streamerId, deleted_at: null },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Delete a project asset
   */
  async deleteProject(id) {
    return await prisma.projectAsset.update({
      where: { id },
      data: { deleted_at: new Date() }
    });
  }

  /**
   * Check if a supporter's email has access to a creator's digital project files.
   * Returns the list of projects the supporter has unlocked based on their transaction history.
   * Gateway-agnostic: works with Midtrans, Xendit, Payhook, or any payment provider.
   */
  async checkAccess(email, streamerId) {
    // Find all successful digital creation transactions from this email to this creator
    const transactions = await prisma.transaction.findMany({
      where: {
        sender_email: {
          equals: email,
          mode: 'insensitive' // Case-insensitive email matching
        },
        streamer_id: streamerId,
        status: 'SUCCESS',
        message: {
          startsWith: '[KARYA:'
        }
      },
      select: {
        gross_amount: true
      }
    });

    // Sum all digital asset donations from this supporter
    const totalSupported = transactions.reduce(
      (sum, t) => sum + parseFloat(t.gross_amount),
      0
    );

    // Get all project assets for this creator
    const projects = await prisma.projectAsset.findMany({
      where: { streamer_id: streamerId, deleted_at: null },
      orderBy: { createdAt: 'desc' }
    });

    // Map projects with unlock status
    const result = projects.map(project => {
      const minSupport = parseFloat(project.min_support);
      const unlocked = totalSupported >= minSupport;
      return {
        id: project.id,
        title: project.title,
        description: project.description,
        min_support: minSupport,
        file_url: unlocked ? project.file_url : null,
        unlocked,
        download_count: project.download_count
      };
    });

    return {
      totalSupported,
      projects: result
    };
  }
}

module.exports = new ProjectService();
