const prisma = require('../config/prisma');

class WhatsappService {
  /**
   * Broadcast Live alerts to all subscribers of a streamer
   * @param {string} streamerId 
   */
  async broadcastLiveAlert(streamerId) {
    try {
      // 1. Fetch site settings for WhatsApp configuration
      const settings = await prisma.siteSetting.findFirst();
      if (!settings) {
        console.log('[WhatsApp Broadcast] Site settings not found. Aborting.');
        return;
      }

      const gateway = settings.whatsappGateway || 'SIMULATION';
      const apiKey = settings.whatsappApiKey || '';
      const sender = settings.whatsappSender || '';
      let template = settings.whatsappTemplate || 'Halo! 👾 Kreator favoritmu {creator} sekarang sedang LIVE streaming di Treetmi! Yuk nonton dan dukung di: {url}';

      // 2. Fetch streamer details
      const streamer = await prisma.user.findUnique({
        where: { id: streamerId }
      });
      if (!streamer) {
        console.log(`[WhatsApp Broadcast] Streamer with ID ${streamerId} not found.`);
        return;
      }

      // 3. Fetch all subscriptions for this streamer
      const subscriptions = await prisma.whatsappAlarmSubscription.findMany({
        where: { streamerId }
      });

      if (subscriptions.length === 0) {
        console.log(`[WhatsApp Broadcast] No subscribers registered for @${streamer.username}.`);
        return;
      }

      // 4. Format the alert message
      const profileUrl = `http://localhost:3000/${streamer.username}`;
      const messageText = template
        .replace(/{creator}/g, streamer.username)
        .replace(/{url}/g, profileUrl);

      console.log(`\n=================== WHATSAPP BROADCAST START ===================`);
      console.log(`[STREAM] @${streamer.username} is now LIVE!`);
      console.log(`[GATEWAY] ${gateway}`);
      console.log(`[TOTAL RECIPIENTS] ${subscriptions.length}`);
      console.log(`[MESSAGE TEMPLATE] ${messageText}`);
      console.log(`================================================================`);

      // 5. Send notifications via the configured gateway
      for (const sub of subscriptions) {
        const phone = sub.phoneNumber;
        let status = 'SUCCESS';
        let errorMessage = null;

        try {
          if (gateway === 'FONNTE') {
            await this.sendViaFonnte(phone, messageText, apiKey);
          } else if (gateway === 'WABLAS') {
            await this.sendViaWablas(phone, messageText, apiKey);
          } else {
            // SIMULATION mode
            status = 'SIMULATED';
            console.log(`[SIMULATION LOG] [Sent to: ${phone}] -> "${messageText}"`);
          }
        } catch (sendErr) {
          status = 'FAILED';
          errorMessage = sendErr.message;
          console.error(`[WhatsApp Broadcast Error] Failed sending to ${phone} via ${gateway}:`, sendErr.message);
        }

        // Save delivery status log in DB
        try {
          await prisma.whatsappBroadcastLog.create({
            data: {
              streamerId: streamer.id,
              phoneNumber: phone,
              message: messageText,
              status: status,
              gateway: gateway,
              errorMessage: errorMessage
            }
          });
        } catch (dbErr) {
          console.error('[WhatsApp Broadcast Log DB Error]', dbErr.message);
        }
      }
      console.log(`=================== WHATSAPP BROADCAST END =====================\n`);

    } catch (error) {
      console.error('[WhatsApp Broadcast Error] Global failure in broadcast:', error);
    }
  }

  /**
   * Send WhatsApp message via Fonnte Gateway API
   */
  async sendViaFonnte(phone, message, apiKey) {
    if (!apiKey) {
      throw new Error('API Key is missing. Check Superadmin WhatsApp Settings.');
    }
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: phone,
        message: message
      })
    });
    const data = await response.json();
    console.log(`[Fonnte Response] for ${phone}:`, data);
    if (!data.status) {
      throw new Error(data.reason || 'Fonnte returned false status');
    }
    return data;
  }

  /**
   * Send WhatsApp message via Wablas Gateway API
   */
  async sendViaWablas(phone, message, apiKey) {
    if (!apiKey) {
      throw new Error('API Key is missing. Check Superadmin WhatsApp Settings.');
    }
    const response = await fetch('https://api.wablas.com/api/send-message', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: phone,
        message: message
      })
    });
    const data = await response.json();
    console.log(`[Wablas Response] for ${phone}:`, data);
    if (!data.status) {
      throw new Error(data.message || 'Wablas returned false status');
    }
    return data;
  }
}

module.exports = new WhatsappService();
