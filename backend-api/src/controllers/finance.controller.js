const financeService = require('../services/finance.service');
const queueService = require('../services/queue.service');
const { getIO } = require('../config/socket');

exports.handleWebhook = async (req, res) => {
  try {
    // Simulasi payload webhook (biasanya dari Midtrans/Xendit)
    const { order_id, transaction_status, custom_field } = req.body;
    
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      const { transaction, streamer } = await financeService.handleWebhookSuccess(order_id);
      
      const io = getIO();
      
      let extraData = {};
      if (transaction.type === 'MABAR') {
        try {
          extraData = JSON.parse(custom_field || '{}');
        } catch (e) {
          console.warn('Failed to parse webhook custom_field:', e);
        }
      }

      // 1. Broadcast alert donasi/mabar / mediashare
      const donationMedia = transaction.donation_media;
      const isVideoMedia = donationMedia && ['YOUTUBE', 'TIKTOK', 'REELS'].includes(donationMedia.media_type);

      if (transaction.mediashare_url || isVideoMedia) {
        const mediaUrl = transaction.mediashare_url || (donationMedia ? donationMedia.media_url : null);
        io.to(`mediashare:${transaction.streamer_id}`).emit('alert:mediashare', {
          id: transaction.id,
          sender_name: transaction.sender_name,
          gross_amount: transaction.gross_amount,
          message: transaction.message,
          mediashare_url: mediaUrl,
          donation_media: donationMedia || null,
          timestamp: new Date()
        });
      } else {
        const eventName = transaction.type === 'DONATION' ? 'alert:donation' : 'alert:mabar';
        io.to(`alert:${transaction.streamer_id}`).emit(eventName, {
          id: transaction.id,
          sender_name: transaction.sender_name,
          gross_amount: transaction.gross_amount,
          message: transaction.message,
          ingame_nickname: extraData.nickname || transaction.sender_name,
          ingame_id: extraData.ingame_id || '',
          donation_media: donationMedia || null,
          timestamp: new Date()
        });
      }

      // 2. Jika MABAR, buat antrean & broadcast update antrean
      if (transaction.type === 'MABAR') {
        await queueService.createQueueEntry(
          transaction.id,
          extraData.package_id,
          extraData.nickname,
          extraData.ingame_id
        );
        
        // Ambil antrean terbaru untuk di-broadcast
        const updatedQueue = await queueService.getActiveQueues(transaction.streamer_id);
        io.to(transaction.streamer_id).emit('queue:update', updatedQueue);
      }

      console.log(`[Finance Controller] Webhook sukses diproses untuk TX: ${transaction.id}`);
    }

    res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('[Webhook Error]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.requestWithdrawal = async (req, res) => {
  try {
    const streamer_id = req.user.id; // Secure identity from token
    const { amount } = req.body;
    const withdrawal = await financeService.requestWithdrawal(streamer_id, amount);
    res.status(201).json({ success: true, message: 'Permintaan penarikan diproses', data: withdrawal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateBankAccount = async (req, res) => {
  try {
    const streamer_id = req.user.id; // Secure identity from token
    const bank = await financeService.updateBankAccount(streamer_id, req.body);
    res.status(200).json({ success: true, message: 'Rekening bank diperbarui', data: bank });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const streamerId = req.user.id;
    const history = await financeService.getFinancialHistory(streamerId);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getDonorsOverlay = async (req, res) => {
  try {
    const { token } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const prisma = require('../config/prisma');

    const streamer = await prisma.user.findFirst({
      where: { widget_token: token }
    });

    if (!streamer) {
      return res.status(404).json({ success: false, message: 'Token widget tidak valid.' });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        streamer_id: streamer.id,
        status: 'SUCCESS'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    const donors = transactions.map(tx => ({
      name: tx.sender_name,
      amount: parseFloat(tx.gross_amount),
      currency: tx.currency_code || 'IDR',
      message: tx.message,
      createdAt: tx.createdAt
    }));

    res.status(200).json({ success: true, data: donors });
  } catch (error) {
    console.error('[Donors Overlay Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

