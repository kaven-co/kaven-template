import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { secureLog } from '../../src/utils/secure-logger';
import { TEST_API_KEY, TEST_EMAIL, TEST_PASSWORD, TEST_TOKEN } from '../constants';

describe('Secure Logger Utility', () => {
  let originalLog: typeof console.log;
  let originalWarn: typeof console.warn;
  let originalError: typeof console.error;
  let logOutput: string[] = [];

  beforeEach(() => {
    originalLog = console.log;
    originalWarn = console.warn;
    originalError = console.error;
    logOutput = [];

    // Mock console methods
    console.log = vi.fn((...args) => logOutput.push(args.map(a => String(a)).join(' ')));
    console.warn = vi.fn((...args) => logOutput.push(args.map(a => String(a)).join(' ')));
    console.error = vi.fn((...args) => logOutput.push(args.map(a => String(a)).join(' ')));
  });

  afterEach(() => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
    vi.restoreAllMocks();
  });

  it('should redact sensitive password and email fields (F2.4.3.2)', () => {
    secureLog.info('Test login', { password: TEST_PASSWORD, email: TEST_EMAIL });

    expect(logOutput.length).toBe(1);
    const log = logOutput[0];

    expect(log).toContain('[REDACTED]');
    expect(log).not.toContain(TEST_PASSWORD);
    // F2.4.3.2 — A: email is PII, now redacted by key.
    expect(log).not.toContain(TEST_EMAIL);
  });

  it('should redact sensitive keys recursively', () => {
    const data = {
      user: {
        name: 'John',
        apiKey: TEST_API_KEY,
        details: {
          token: TEST_TOKEN
        }
      }
    };
    
    secureLog.info('Recursion test', data);
    const log = logOutput[0] || '';
    
    expect(log).toContain('[REDACTED]');
    expect(log).not.toContain('abcdef123456');
    expect(log).not.toContain('jwt-token-here');
    expect(log).toContain('John');
  });

  it('should handle arrays and redact email (F2.4.3.2)', () => {
      const data = [
          { password: '123' },
          { email: 'a@b.com' }
      ];
      secureLog.info('Array test', data);
      const log = logOutput[0] || '';
      expect(log).toContain('[REDACTED]');
      // F2.4.3.2 — A: email is PII, now redacted.
      expect(log).not.toContain('a@b.com');
  });
  
  it('should handle null/undefined', () => {
      secureLog.info('Null test', null);
      expect(logOutput[0]).toContain('[INFO] Null test');
  });
});
