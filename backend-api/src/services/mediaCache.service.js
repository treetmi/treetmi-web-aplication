const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CACHE_DIR = path.join(__dirname, '../../uploads/mediashare-cache');
const CACHE_TTL_HOURS = parseInt(process.env.MEDIA_CACHE_TTL_HOURS || '24', 10);
const MAX_VIDEO_BYTES = parseInt(process.env.MEDIA_CACHE_MAX_BYTES || `${80 * 1024 * 1024}`, 10);

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function getPublicUrl(filename) {
  return `/uploads/mediashare-cache/${filename}`;
}

function isProbablyVideoResponse(response) {
  const type = response.headers.get('content-type') || '';
  return type.includes('video/') || type.includes('application/octet-stream');
}

async function downloadVideoToCache(videoUrl, prefix = 'media') {
  ensureCacheDir();

  const response = await fetch(videoUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36',
      'Accept': 'video/mp4,video/*,*/*'
    }
  });

  if (!response.ok || !response.body || !isProbablyVideoResponse(response)) {
    throw new Error('Sumber video tidak bisa diunduh.');
  }

  const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
  if (contentLength > MAX_VIDEO_BYTES) {
    throw new Error('Ukuran video terlalu besar untuk media share.');
  }

  const filename = `${prefix}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.mp4`;
  const filePath = path.join(CACHE_DIR, filename);
  const file = fs.createWriteStream(filePath);

  let downloaded = 0;
  for await (const chunk of response.body) {
    downloaded += chunk.length;
    if (downloaded > MAX_VIDEO_BYTES) {
      file.destroy();
      fs.rmSync(filePath, { force: true });
      throw new Error('Ukuran video terlalu besar untuk media share.');
    }
    file.write(chunk);
  }

  await new Promise((resolve, reject) => {
    file.end(resolve);
    file.on('error', reject);
  });

  return {
    filename,
    publicUrl: getPublicUrl(filename),
    size: downloaded,
    expiresAt: new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString()
  };
}

function extractInstagramVideoUrl(html) {
  const patterns = [
    /"video_url"\s*:\s*"([^"]+)"/,
    /"contentUrl"\s*:\s*"([^"]+\.mp4[^"]*)"/,
    /<meta\s+property=["']og:video(?::secure_url)?["']\s+content=["']([^"']+)["']/i,
    /<meta\s+content=["']([^"']+)["']\s+property=["']og:video(?::secure_url)?["']/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return match[1]
        .replace(/\\u0026/g, '&')
        .replace(/\\\//g, '/')
        .replace(/&amp;/g, '&');
    }
  }

  return null;
}

async function importInstagramReelToCache(reelUrl) {
  ensureCacheDir();

  const response = await fetch(reelUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
    }
  });

  if (!response.ok) {
    throw new Error('Instagram menolak pengecekan Reels.');
  }

  const html = await response.text();
  const videoUrl = extractInstagramVideoUrl(html);
  if (!videoUrl) {
    throw new Error('Video Reels belum bisa diimport. Reels mungkin private, dibatasi, atau Instagram meminta login.');
  }

  return downloadVideoToCache(videoUrl, 'reels');
}

function cleanupExpiredMediaCache(maxAgeHours = CACHE_TTL_HOURS) {
  ensureCacheDir();
  const cutoff = Date.now() - maxAgeHours * 60 * 60 * 1000;
  let deleted = 0;

  for (const filename of fs.readdirSync(CACHE_DIR)) {
    const filePath = path.join(CACHE_DIR, filename);
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) continue;
    if (stat.mtimeMs < cutoff) {
      fs.rmSync(filePath, { force: true });
      deleted++;
    }
  }

  return deleted;
}

function startMediaCacheCleanup() {
  ensureCacheDir();
  cleanupExpiredMediaCache();
  setInterval(() => {
    try {
      const deleted = cleanupExpiredMediaCache();
      if (deleted > 0) console.log(`[MediaCache] Menghapus ${deleted} file cache mediashare lama.`);
    } catch (err) {
      console.warn('[MediaCache] Cleanup gagal:', err.message);
    }
  }, 24 * 60 * 60 * 1000).unref();
}

module.exports = {
  CACHE_TTL_HOURS,
  cleanupExpiredMediaCache,
  downloadVideoToCache,
  importInstagramReelToCache,
  startMediaCacheCleanup
};
