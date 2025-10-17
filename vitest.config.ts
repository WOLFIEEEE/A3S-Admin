import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'A3S Admin Tests',
    environment: 'happy-dom',
    // setupFiles: ['./tests/setup/setup-env.ts'], // Tests folder removed
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        // 'tests/', // Tests folder removed
        '*.config.*',
        '.next/',
        'public/',
        '**/*.d.ts',
        '**/*.spec.*',
        '**/*.test.*',
        '**/mockData/**',
        '**/fixtures/**'
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60
      }
    },
    // include: ['tests/**/*.{test,spec}.{ts,tsx}'], // Tests folder removed
    exclude: ['node_modules', '.next'], // Removed tests/e2e reference
    testTimeout: 10000,
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/app': path.resolve(__dirname, './src/app'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/constants': path.resolve(__dirname, './src/constants'),
      '@/config': path.resolve(__dirname, './src/config')
    }
  }
});
