const { describe, it } = require('node:test');
const assert = require('node:assert');
const { signToken, verifyToken, validatePassword } = require('../lib/auth');

// Ensure JWT_SECRET is set for tests
process.env.JWT_SECRET = 'test_secret_for_unit_tests';

describe('auth.js', () => {
  describe('validatePassword', () => {
    it('should reject empty password', () => {
      const result = validatePassword('');
      assert.strictEqual(result.valid, false);
    });

    it('should reject short password', () => {
      const result = validatePassword('12345');
      assert.strictEqual(result.valid, false);
    });

    it('should accept valid password', () => {
      const result = validatePassword('valid_password');
      assert.strictEqual(result.valid, true);
    });

    it('should reject overly long password', () => {
      const result = validatePassword('a'.repeat(129));
      assert.strictEqual(result.valid, false);
    });
  });

  describe('signToken & verifyToken', () => {
    it('should sign and verify a token', () => {
      const payload = { id: 1, username: 'test' };
      const token = signToken(payload);
      assert.ok(typeof token === 'string');
      assert.ok(token.length > 0);

      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = {
        status() { return this; },
        json() { return this; }
      };
      let nextCalled = false;
      verifyToken(req, res, () => { nextCalled = true; });
      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.user.username, 'test');
    });

    it('should reject missing token', () => {
      const req = { headers: {} };
      let statusCode = 0;
      const res = {
        status(code) { statusCode = code; return this; },
        json() { return this; }
      };
      verifyToken(req, res, () => {});
      assert.strictEqual(statusCode, 401);
    });
  });
});
