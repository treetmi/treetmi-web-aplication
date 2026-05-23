const crypto = require('crypto');

/**
 * Meng-hash password menggunakan PBKDF2 dengan salt acak 16 byte
 * @param {string} password 
 * @returns {string} salt:hash_hex
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Memverifikasi password masukan terhadap password terenkripsi dari DB
 * @param {string} password 
 * @param {string} storedPassword 
 * @returns {boolean}
 */
function verifyPassword(password, storedPassword) {
  if (!storedPassword || !storedPassword.includes(':')) {
    return false;
  }
  const [salt, hash] = storedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

module.exports = {
  hashPassword,
  verifyPassword
};
