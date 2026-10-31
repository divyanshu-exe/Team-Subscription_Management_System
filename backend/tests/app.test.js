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
