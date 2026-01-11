import type { Page } from '@playwright/test';

export function uniqueName(prefix: string) {
  const random = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

export async function mockSession(page: Page, roles: string[]) {
  await page.route('**/api/auth/session', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        userId: 'e2e-user',
        name: 'E2E Bot',
        email: 'qa@example.com',
        tenantId: 'tenant_e2e',
        roles,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      })
    });
  });
}
