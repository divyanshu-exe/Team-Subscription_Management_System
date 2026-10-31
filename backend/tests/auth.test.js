// OWNER: BE-1
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
