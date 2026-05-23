const prisma = require('../config/prisma');

// Short words that MUST match using word boundaries to prevent over-censoring
const SHORT_WORDS = ['wd', 'depo', 'jp', 'asu', 'judi', 'slot', 'fuck'];

class FilterService {
  constructor() {
    this.cachedWords = null;
    this.cacheExpiry = null;
  }

  /**
   * Clear in-memory cache when word list is updated via superadmin
   */
  invalidateCache() {
    this.cachedWords = null;
    this.cacheExpiry = null;
  }

  /**
   * Get all global banned words from DB (with caching)
   */
  async getBannedWords() {
    const now = Date.now();
    if (this.cachedWords && this.cacheExpiry && now < this.cacheExpiry) {
      return this.cachedWords;
    }

    try {
      const dbWords = await prisma.filterWord.findMany({
        where: { userId: null },
        select: { word: true }
      });
      this.cachedWords = dbWords.map(w => w.word.toLowerCase());
      this.cacheExpiry = now + 5 * 60 * 1000; // 5 minutes cache
      return this.cachedWords;
    } catch (err) {
      console.error('Error fetching global filter words from database:', err);
      return this.cachedWords || [];
    }
  }

  /**
   * Combine global cached filter words with streamer-specific custom filter words
   */
  async getBannedWordsForStreamer(streamerId) {
    const globalWords = await this.getBannedWords();
    if (!streamerId) return globalWords;

    try {
      const dbWords = await prisma.filterWord.findMany({
        where: { userId: streamerId },
        select: { word: true }
      });
      const customWords = dbWords.map(w => w.word.toLowerCase());
      // Merge and remove duplicates
      return [...new Set([...globalWords, ...customWords])];
    } catch (err) {
      console.error(`Error fetching custom filter words for streamer ${streamerId}:`, err);
      return globalWords;
    }
  }

  /**
   * Generate robust regex matching variations (spaced-out, dots, hyphens, lookalikes)
   */
  generateRegexForWord(word) {
    const isShort = SHORT_WORDS.includes(word) || word.length <= 4;
    
    const charPatterns = word.split('').map(char => {
      if (char === 'o') return '[o0]';
      if (char === 'i') return '[i1!]';
      if (char === 'a') return '[a4]';
      if (char === 'e') return '[e3]';
      if (char === 's') return '[s5\\$]';
      if (char === 'g') return '[g9]';
      if (char === 'b') return '[b8]';
      if (char === 't') return '[t7]';
      return char;
    });
    
    const separator = '[\\s\\.\\-_@#\\$\\*%]*';
    const pattern = charPatterns.join(separator);
    
    if (isShort) {
      return new RegExp(`\\b${pattern}\\b`, 'gi');
    } else {
      return new RegExp(pattern, 'gi');
    }
  }

  /**
   * Censor matching words in text
   */
  cleanText(text, bannedWords) {
    if (!text) return text;
    let censoredText = text;
    
    for (const word of bannedWords) {
      const regex = this.generateRegexForWord(word);
      censoredText = censoredText.replace(regex, (match) => {
        return '*'.repeat(match.length);
      });
    }
    return censoredText;
  }

  /**
   * Filter text if streamer has profanity_filter enabled (default: true)
   */
  async filterMessageIfNeeded(streamerId, message) {
    if (!message) return message;
    
    try {
      const setting = await prisma.creatorMediaSetting.findUnique({
        where: { streamer_id: streamerId }
      });
      
      const isEnabled = setting ? setting.profanity_filter : true;
      
      if (isEnabled) {
        const bannedWords = await this.getBannedWordsForStreamer(streamerId);
        if (bannedWords.length > 0) {
          return this.cleanText(message, bannedWords);
        }
      }
    } catch (err) {
      console.error('Error in filterMessageIfNeeded:', err);
    }
    
    return message;
  }
}

module.exports = new FilterService();
