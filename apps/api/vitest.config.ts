import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.integration.test.ts', '**/*.e2e.spec.ts', 'src/services/authorization.service.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    alias: {
      '@/': new URL('./src/', import.meta.url).pathname,
    },
  },
});
