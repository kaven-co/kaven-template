// ESLint v9 flat config for apps/api (Fastify backend).
// Mínimo viável — usa typescript-eslint recommended com overrides
// relaxados para não bloquear o código existente. Serve para:
//   - Cumprir o DoD "pnpm lint" passando
//   - Permitir que o Turbo execute `turbo run lint` sem skipar o api package
//   - Pegar erros objetivos (sintaxe, no-undef) antes do typecheck
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '**/*.spec.ts', '**/*.test.ts'],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
      'prefer-const': 'warn',
      'no-empty': 'warn',
    },
  }
);
