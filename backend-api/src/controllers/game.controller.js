const gameService = require('../services/game.service');

exports.createPackage = async (req, res) => {
  try {
    const streamer_id = req.user.id; // Secure identity from token
    const pkg = await gameService.createPackage(streamer_id, req.body);

    try {
      const { getIO } = require('../config/socket');
      getIO().to(streamer_id).emit('profile:updated', { userId: streamer_id });
    } catch (e) {}

    res.status(201).json({ success: true, message: 'Paket mabar dibuat', data: pkg });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getPackages = async (req, res) => {
  try {
    const { streamerId } = req.params;
    const packages = await gameService.getPackagesByStreamer(streamerId);
    res.status(200).json({ success: true, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await gameService.updatePackage(id, req.body);

    try {
      const { getIO } = require('../config/socket');
      getIO().to(req.user.id).emit('profile:updated', { userId: req.user.id });
    } catch (e) {}

    res.status(200).json({ success: true, message: 'Paket diperbarui', data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    await gameService.deletePackage(id);

    try {
      const { getIO } = require('../config/socket');
      getIO().to(req.user.id).emit('profile:updated', { userId: req.user.id });
    } catch (e) {}

    res.status(200).json({ success: true, message: 'Paket dihapus' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};