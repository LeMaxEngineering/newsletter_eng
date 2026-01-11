/// <reference types="node" />
import { defineConfig } from '@playwright/test';

const reuse = process.env.CI ? false : true;

export default defineConfig({
  globalSetup: './tests/e2e/global-setup.ts',
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 5_000
  },
  retries: process.env.CI ? 2 : 0,
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry'
  },
  webServer: [
    {
      command: 'corepack pnpm --filter @neewsletter/api start:dev',
      url: 'http://localhost:4000/api/health',
      reuseExistingServer: reuse,
      stdout: 'pipe'
    },
    {
      command: 'corepack pnpm --filter @neewsletter/web dev',
      url: 'http://localhost:5173',
      reuseExistingServer: reuse,
      stdout: 'pipe'
    }
  ]
});
