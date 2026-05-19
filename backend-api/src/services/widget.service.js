const prisma = require('../config/prisma');

const DEFAULT_TIERS = [
  { min: 0,       max: 25000,   prefix: '',           sound_key: 'coin',    gif_key: 'coin' },
  { min: 25000,   max: 100000,  prefix: 'Wow',        sound_key: 'bell',    gif_key: 'wallet_fly' },
  { min: 100000,  max: 1000000, prefix: 'Mantap Bro', sound_key: 'fanfare', gif_key: 'wallet_anim' },
  { min: 1000000, max: null,    prefix: 'Gile Bro',   sound_key: 'epic',    gif_key: 'coin_wallet' },
];

class WidgetService {
  async getOrCreate(streamerId) {
    let setting = await prisma.widgetSetting.findUnique({
      where: { streamer_id: streamerId }
    });
    if (!setting) {
      setting = await prisma.widgetSetting.create({
        data: { streamer_id: streamerId }
      });
    }
    return setting;
  }

  async getByToken(token) {
    const user = await prisma.user.findFirst({ where: { widget_token: token } });
    if (!user) return null;
    return this.getOrCreate(user.id);
  }

  async update(streamerId, data) {
    const { color_donation, color_mabar, tts_enabled, tts_speed, tts_pitch, alert_duration_sec, sound_tiers, coin_sound_key, coin_sound_url, mediashare_enabled, mediashare_min_donation } = data;
    return prisma.widgetSetting.upsert({
      where: { streamer_id: streamerId },
      update: { 
        color_donation, color_mabar, tts_enabled, tts_speed, tts_pitch, alert_duration_sec, sound_tiers, coin_sound_key, coin_sound_url,
        mediashare_enabled,
        mediashare_min_donation: mediashare_min_donation !== undefined ? parseFloat(mediashare_min_donation) : undefined
      },
      create: { 
        streamer_id: streamerId, color_donation, color_mabar, tts_enabled, tts_speed, tts_pitch, alert_duration_sec, sound_tiers, coin_sound_key, coin_sound_url,
        mediashare_enabled,
        mediashare_min_donation: mediashare_min_donation !== undefined ? parseFloat(mediashare_min_donation) : undefined
      }
    });
  }
}

module.exports = new WidgetService();
module.exports.DEFAULT_TIERS = DEFAULT_TIERS;
