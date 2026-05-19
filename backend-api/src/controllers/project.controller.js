const projectService = require('../services/project.service');

exports.createProject = async (req, res) => {
  try {
    const streamerId = req.user.id; // Secure identity from token
    const { title, description, file_url, min_support } = req.body;
    
    if (!title || !file_url || isNaN(Number(min_support)) || Number(min_support) < 0) {
      return res.status(400).json({ success: false, message: 'Input tidak valid. Judul, tautan file, dan minimal donasi wajib diisi.' });
    }
    
    const project = await projectService.createProject(streamerId, {
      title,
      description,
      file_url,
      min_support
    });
    
    res.status(201).json({ success: true, message: 'Proyek digital berhasil dibagikan!', data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const { streamerId } = req.params;
    const projects = await projectService.getProjectsByStreamer(streamerId);
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const streamerId = req.user.id;
    const { title, description, file_url, min_support } = req.body;

    if (!title || !file_url || isNaN(Number(min_support)) || Number(min_support) < 0) {
      return res.status(400).json({ success: false, message: 'Input tidak valid. Judul, tautan file, dan minimal donasi wajib diisi.' });
    }

    // Check project ownership
    const prisma = require('../config/prisma');
    const project = await prisma.projectAsset.findUnique({
      where: { id }
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Proyek digital tidak ditemukan.' });
    }

    if (project.streamer_id !== streamerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Anda bukan pemilik proyek ini.' });
    }

    const updated = await projectService.updateProject(id, {
      title,
      description,
      file_url,
      min_support
    });

    res.status(200).json({ success: true, message: 'Proyek digital berhasil diperbarui!', data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const streamerId = req.user.id; // Secure identity from token
    
    // Check project ownership
    const prisma = require('../config/prisma');
    const project = await prisma.projectAsset.findUnique({
      where: { id }
    });
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Proyek digital tidak ditemukan.' });
    }
    
    if (project.streamer_id !== streamerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Anda bukan pemilik proyek ini.' });
    }
    
    await projectService.deleteProject(id);
    res.status(200).json({ success: true, message: 'Proyek digital berhasil dihapus.' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Check if a supporter email has access to a creator's digital project files.
 * Public endpoint — no login required.
 * GET /projects/check-access?email=xxx&streamerId=xxx
 */
exports.checkAccess = async (req, res) => {
  try {
    const { email, streamerId } = req.query;

    if (!email || !streamerId) {
      return res.status(400).json({
        success: false,
        message: 'Parameter email dan streamerId wajib diisi.'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid.'
      });
    }

    const result = await projectService.checkAccess(email, streamerId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error checking project access:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
