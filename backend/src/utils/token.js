// OWNER: BE-1
// PURPOSE: JWT generation, verification, and SHA-256 reset token generation

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

/**
 * Signs a JWT token with the application secret
 * @param {Object} payload
 * @param {string} [expiresIn]
 * @returns {string}
 */
function signJwt(payload, expiresIn = env.JWT_EXPIRES_IN) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

/**
 * Verifies and decodes a JWT token
 * @param {string} token
 * @returns {Object}
 */
function verifyJwt(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

/**
 * Generates a random reset token and returns { raw, hash } where hash is sha256 of raw
 * @returns {{ raw: string, hash: string }}
 */
function generateResetToken() {
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = hashToken(raw);
  return { raw, hash };
}

/**
 * Computes SHA-256 hash of a string
 * @param {string} token
 * @returns {string}
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  signJwt,
  verifyJwt,
  generateResetToken,
  hashToken,
};
