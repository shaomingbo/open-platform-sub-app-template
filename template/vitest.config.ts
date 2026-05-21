import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    passWithNoTests: true,
    // Vitest's default `include` is **/*.{test,spec}.{js,ts,jsx,tsx} which
    // would pick up Playwright `e2e/*.spec.ts` files; those import
    // `@playwright/test` (a Node-only runner) and crash under happy-dom.
    // Scope vitest to src/ to keep the two test runtimes cleanly separated.
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        perFile: true,
        'src/services/**': { lines: 80, functions: 80, branches: 70 },
        'src/stores/**': { lines: 80, functions: 80 },
      },
      exclude: [
        'src/services/**/generated/**',
        'src/types/api/**',
        'src/test/**',
        'src/.umi/**',
        '.umi/**',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
