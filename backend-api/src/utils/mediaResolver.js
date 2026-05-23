function getUrl(input) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  try {
    return new URL(trimmed);
  } catch {
    try {
      return new URL(`https://${trimmed}`);
    } catch {
      return null;
    }
  }
}

function normalizeHost(hostname) {
  return hostname.toLowerCase().replace(/^www\./, '');
}

function resolveMediaUrl(rawUrl, requestedType) {
  const requested = requestedType ? String(requestedType).toUpperCase() : null;
  const trimmed = typeof rawUrl === 'string' ? rawUrl.trim() : '';
  if (requested === 'REELS' && /^\/uploads\/mediashare-cache\/.+\.(mp4|webm|mov)$/i.test(trimmed)) {
    return {
      valid: true,
      mediaType: 'REELS',
      normalizedUrl: trimmed,
      mediaUrl: trimmed,
      provider: 'instagram',
      playbackMode: 'native-video',
      autoplaySupported: true,
      isPortrait: true,
      message: 'Reels cache valid dan siap autoplay di overlay.'
    };
  }

  const url = getUrl(rawUrl);
  if (!url) {
    return {
      valid: false,
      message: 'Link media tidak valid. Pastikan link diawali https:// dan bisa dibuka.'
    };
  }

  const host = normalizeHost(url.hostname);
  const path = url.pathname;

  if (requested === 'REELS' && /\.(mp4|webm|mov)$/i.test(path)) {
    return {
      valid: true,
      mediaType: 'REELS',
      normalizedUrl: url.toString(),
      mediaUrl: url.toString(),
      provider: 'instagram',
      playbackMode: 'native-video',
      autoplaySupported: true,
      isPortrait: true,
      message: 'Direct video Reels valid dan siap autoplay di overlay.'
    };
  }

  if (host === 'youtu.be' || host.endsWith('youtube.com')) {
    let id = null;
    let isShort = false;

    if (host === 'youtu.be') {
      id = path.split('/').filter(Boolean)[0] || null;
    } else if (path.startsWith('/shorts/')) {
      id = path.split('/').filter(Boolean)[1] || null;
      isShort = true;
    } else if (path.startsWith('/embed/')) {
      id = path.split('/').filter(Boolean)[1] || null;
    } else {
      id = url.searchParams.get('v');
    }

    if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) {
      return { valid: false, message: 'Link YouTube tidak valid. Gunakan link video atau Shorts yang benar.' };
    }

    const normalizedUrl = isShort
      ? `https://www.youtube.com/shorts/${id}`
      : `https://www.youtube.com/watch?v=${id}`;

    return {
      valid: !requested || requested === 'YOUTUBE',
      mediaType: 'YOUTUBE',
      normalizedUrl,
      provider: 'youtube',
      playbackMode: 'api',
      autoplaySupported: true,
      isPortrait: isShort,
      message: isShort ? 'YouTube Shorts valid dan akan tampil portrait.' : 'YouTube valid dan siap autoplay di overlay.'
    };
  }

  if (host.endsWith('tiktok.com')) {
    const match = path.match(/\/@[^/]+\/video\/(\d+)/);
    if (!match) {
      return {
        valid: false,
        message: 'Link TikTok harus format video publik, contoh: https://www.tiktok.com/@username/video/1234567890'
      };
    }

    const username = path.split('/').filter(Boolean)[0];
    return {
      valid: !requested || requested === 'TIKTOK',
      mediaType: 'TIKTOK',
      normalizedUrl: `https://www.tiktok.com/${username}/video/${match[1]}`,
      provider: 'tiktok',
      playbackMode: 'player',
      autoplaySupported: true,
      isPortrait: true,
      message: 'TikTok valid dan siap autoplay di overlay.'
    };
  }

  if (host.endsWith('instagram.com')) {
    const match = path.match(/\/(reel|reels|p)\/([A-Za-z0-9_-]+)/);
    if (!match) {
      return {
        valid: false,
        message: 'Link Instagram harus berupa Reels publik, contoh: https://www.instagram.com/reel/ABC123/'
      };
    }

    return {
      valid: !requested || requested === 'REELS',
      mediaType: 'REELS',
      normalizedUrl: `https://www.instagram.com/reel/${match[2]}/`,
      provider: 'instagram',
      playbackMode: 'embed',
      autoplaySupported: false,
      isPortrait: true,
      message: 'Reels valid. Saat ini memakai embed bersih; autoplay Instagram bergantung pada pembatasan platform.'
    };
  }

  return {
    valid: false,
    message: 'Platform belum didukung. Gunakan YouTube, TikTok, atau Instagram Reels.'
  };
}

module.exports = { resolveMediaUrl };
