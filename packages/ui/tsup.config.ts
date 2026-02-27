import { defineConfig } from 'tsup';

export default defineConfig([
  // Full build — all components including organisms, templates, compat
  {
    entry:      { index: 'src/index.ts' },
    format:     ['esm', 'cjs'],
    dts:        { compilerOptions: { incremental: false } },
    clean:      true,
    external:   ['react', 'react-dom', 'tailwindcss'],
    outDir:     'dist',
    sourcemap:  true,
    banner:     { js: '"use client";' },
  },
  // Lite build — atoms + molecules + tokens only
  {
    entry:      { lite: 'src/lite.ts' },
    format:     ['esm', 'cjs'],
    dts:        { compilerOptions: { incremental: false } },
    external:   ['react', 'react-dom', 'tailwindcss'],
    outDir:     'dist',
    sourcemap:  true,
    banner:     { js: '"use client";' },
  },
  // Tailwind preset — no React, just config
  {
    entry:      { 'tailwind-preset': 'src/tailwind-preset.ts' },
    format:     ['esm', 'cjs'],
    dts:        { compilerOptions: { incremental: false } },
    external:   ['tailwindcss'],
    outDir:     'dist',
    treeshake:  true,
  },
]);
