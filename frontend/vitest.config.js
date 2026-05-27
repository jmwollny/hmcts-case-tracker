import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
  },
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html'], // 'text' prints a summary in terminal, 'html' builds the webpage
    reportsDirectory: './coverage', // Configures where the folder is generated
  },
});
