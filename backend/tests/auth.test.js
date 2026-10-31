// OWNER: BE-1

// PURPOSE: Verify server health endpoint, password rule, and response format

const request = require('supertest');
const app = require('../src/app');
const { isValidPassword } = require('../src/utils/password');

describe('App Foundation & Health Check (Prompt 1 & B1-2)', () => {
  test('GET /api/health returns { success: true }', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });

  test('Password rule: rejects 8-character passwords and accepts valid 9+ character passwords', () => {
    // 8 chars with upper, lower, special -> REJECTED
    expect(isValidPassword('Abcdef1!')).toBe(false);

    // 9 chars with upper, lower, special -> ACCEPTED
    expect(isValidPassword('Abcdefg1!')).toBe(true);

    // Missing uppercase -> REJECTED
    expect(isValidPassword('abcdefgh1!')).toBe(false);

    // Missing lowercase -> REJECTED
    expect(isValidPassword('ABCDEFGH1!')).toBe(false);

    // Missing special character -> REJECTED
    expect(isValidPassword('Abcdefgh12')).toBe(false);
  });
});

// PURPOSE: Auth validation, token generation, and password rules unit tests

const { signupSchema, resetPasswordSchema } = require('../src/modules/auth/auth.schema');
const { generateResetToken, hashToken } = require('../src/utils/token');

describe('Auth Validation & Token Security (B1-3)', () => {
  test('Signup schema: rejects 8-char password (Abcdef1!) and accepts 9-char (Abcdefg1!)', () => {
    const invalidResult = signupSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Abcdef1!',
    });
    expect(invalidResult.success).toBe(false);

    const validResult = signupSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Abcdefg1!',
    });
    expect(validResult.success).toBe(true);
  });

  test('Reset password schema enforces identical 9+ char password rule', () => {
    const invalidResult = resetPasswordSchema.safeParse({
      token: 'some-random-token',
      password: 'Abcdef1!',
    });
    expect(invalidResult.success).toBe(false);

    const validResult = resetPasswordSchema.safeParse({
      token: 'some-random-token',
      password: 'Abcdefg1!',
    });
    expect(validResult.success).toBe(true);
  });

  test('Reset token generator produces secure raw token and SHA-256 hash', () => {
    const { raw, hash } = generateResetToken();

    expect(raw).toBeDefined();
    expect(hash).toBeDefined();
    expect(raw).not.toBe(hash);
    expect(raw.length).toBe(64); // 32 bytes hex
    expect(hash.length).toBe(64); // SHA-256 hex
    expect(hashToken(raw)).toBe(hash);
  });
});

