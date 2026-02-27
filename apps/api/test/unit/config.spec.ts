import { describe, it, expect } from 'vitest';
import { envSchema } from '../../src/config/env.schema';
import { TEST_DB_URL, TEST_REDIS_URL, TEST_SECRET_32_CHARS, TEST_SHORT_PASSWORD } from '../constants';

describe('Environment Configuration (Zod)', () => {
  it('should validate valid configuration', () => {
    const validEnv = {
      DATABASE_URL: TEST_DB_URL,
      REDIS_URL: TEST_REDIS_URL,
      JWT_SECRET: TEST_SECRET_32_CHARS,
      REFRESH_TOKEN_SECRET: TEST_SECRET_32_CHARS,
    };
    const result = envSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
  });

  it('should fail if DATABASE_URL is missing', () => {
    const invalidEnv = {
      REDIS_URL: TEST_REDIS_URL,
      JWT_SECRET: TEST_SECRET_32_CHARS,
    };
    const result = envSchema.safeParse(invalidEnv);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('DATABASE_URL'))).toBe(true);
    }
  });

  it('should fail if JWT_SECRET is too short', () => {
    const invalidEnv = {
      DATABASE_URL: TEST_DB_URL,
      REDIS_URL: TEST_REDIS_URL,
      JWT_SECRET: TEST_SHORT_PASSWORD,
      REFRESH_TOKEN_SECRET: TEST_SECRET_32_CHARS,
    };
    const result = envSchema.safeParse(invalidEnv);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('JWT_SECRET'))).toBe(true);
    }
  });

  it('should use defaults for optional fields', () => {
    const minimalEnv = {
      DATABASE_URL: TEST_DB_URL,
      REDIS_URL: TEST_REDIS_URL,
      JWT_SECRET: TEST_SECRET_32_CHARS,
      REFRESH_TOKEN_SECRET: TEST_SECRET_32_CHARS,
      // PORT missing, should default
    };
    const result = envSchema.safeParse(minimalEnv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PORT).toBe(8000);
      expect(result.data.LOG_LEVEL).toBe('info');
    }
  });
});
