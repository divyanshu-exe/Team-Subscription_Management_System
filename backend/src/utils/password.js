// OWNER: BE-1
// PURPOSE: Password strength validation and bcrypt hashing helpers

const bcrypt = require('bcrypt');

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/;

/**
 * Validates password strength: at least 9 characters, 1 uppercase, 1 lowercase, 1 special character
 * @param {string} password
 * @returns {boolean}
 */
function isValidPassword(password) {
  if (typeof password !== 'string') return false;
  return PASSWORD_REGEX.test(password);
}

/**
 * Hashes a plaintext password with bcrypt (10 rounds)
 * @param {string} password
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

/**
 * Compares a plaintext password with a bcrypt hash
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

module.exports = {
  PASSWORD_REGEX,
  isValidPassword,
  hashPassword,
  comparePassword,
};