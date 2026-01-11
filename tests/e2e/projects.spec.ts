import { expect, test } from '@playwright/test';
import { mockSession, uniqueName } from './utils.js';

test.describe('Editor RBAC & CRUD', () => {
  test('admin can manage projects and templates end-to-end', async ({ page }) => {
    await mockSession(page, ['admin']);

    await page.goto('/editor');
    await expect(page.getByRole('heading', { name: 'Project management' })).toBeVisible();

    const projectName = uniqueName('project');
    const ownerName = `Owner ${projectName.slice(-4)}`;
    const templateName = uniqueName('template');
    const renamedTemplate = `${templateName}-renamed`;

    await page.getByLabel('Project name').fill(projectName);
    await page.getByLabel('Owner').fill(ownerName);
    await page.getByRole('button', { name: 'Create project' }).click();
    await expect(page.getByText('Project saved successfully.', { exact: false })).toBeVisible();

    const projectSelect = page.getByLabel('Active project');
    await projectSelect.selectOption({ label: projectName });

    await page.getByLabel('Template name').fill(templateName);
    await page.getByLabel('Version').fill('2.0.0');
    await page.getByRole('button', { name: 'Create template' }).click();
    await expect(page.getByText('Template created successfully.', { exact: false })).toBeVisible();
    const templateCard = page.locator('.template-card').filter({ hasText: templateName });
    await expect(templateCard).toBeVisible();

    await templateCard.getByRole('button', { name: 'Rename' }).click();
    await templateCard.getByRole('textbox').fill(renamedTemplate);
    await templateCard.getByRole('button', { name: 'Save' }).click();
    await expect(templateCard.getByRole('heading', { name: renamedTemplate })).toBeVisible();

    await templateCard.getByRole('button', { name: /Publish|Mark draft/ }).click();
    await templateCard.getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.template-card').filter({ hasText: renamedTemplate })).toHaveCount(0);

    await page.getByRole('button', { name: 'Delete project' }).click();
    await expect(page.locator('select option').filter({ hasText: projectName })).toHaveCount(0);
  });

  test('viewer role cannot access editor actions', async ({ page }) => {
    await mockSession(page, ['viewer']);

    await page.goto('/');
    await expect(page.locator('nav .nav-link--disabled').filter({ hasText: 'Editor' })).toBeVisible();

    await page.goto('/editor');
    await expect(page.getByRole('heading', { name: 'Access restricted' })).toBeVisible();
    await expect(
      page.getByText('You lack the required role for this view.', { exact: false })
    ).toBeVisible();
  });
});
