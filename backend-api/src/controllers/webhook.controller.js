const { getIO } = require('../config/socket');

/**
 * Controller untuk menangani testing webhook donasi
 */
exports.testWebhook = async (req, res) => {
  try {
    const { streamer_id, sender_name, gross_amount, message } = req.body;

    // Validasi payload
    if (!streamer_id || !sender_name || gross_amount === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payload tidak lengkap (streamer_id, sender_name, gross_amount wajib ada)' 
      });
    }

    console.log(`[Webhook Controller] Donasi diterima untuk ${streamer_id} sebesar Rp${gross_amount}`);

    // Emit event ke Socket.io room streamer
    const io = getIO();
    io.to(streamer_id).emit('alert:donation', {
      streamer_id,
      sender_name,
      gross_amount,
      message,
      timestamp: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Event alert:donation berhasil dipancarkan'
    });
  } catch (error) {
    console.error('[Webhook Controller Error]', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
