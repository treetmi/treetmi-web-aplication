const { resolveMediaUrl } = require('../utils/mediaResolver');
const { importInstagramReelToCache, CACHE_TTL_HOURS } = require('../services/mediaCache.service');

exports.resolvePublicMedia = async (req, res) => {
  try {
    const { url, mediaType, importToCache } = req.body;
    const resolved = resolveMediaUrl(url, mediaType);

    if (resolved.valid && resolved.mediaType === 'REELS' && importToCache) {
      try {
        const cached = await importInstagramReelToCache(resolved.normalizedUrl);
        resolved.cachedUrl = cached.publicUrl;
        resolved.mediaUrl = cached.publicUrl;
        resolved.playbackMode = 'native-video';
        resolved.autoplaySupported = true;
        resolved.cacheExpiresAt = cached.expiresAt;
        resolved.cacheTtlHours = CACHE_TTL_HOURS;
        resolved.message = `Reels berhasil diimport dan siap autoplay. File cache otomatis dihapus dalam ${CACHE_TTL_HOURS} jam.`;
      } catch (err) {
        resolved.importError = err.message;
        resolved.cacheTtlHours = CACHE_TTL_HOURS;
        resolved.message = `${resolved.message} Import autoplay belum berhasil: ${err.message}`;
      }
    }

    const status = resolved.valid ? 200 : 400;
    res.status(status).json({
      success: resolved.valid,
      data: resolved.valid ? resolved : null,
      message: resolved.message
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
