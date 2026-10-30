import { test, expect } from '@playwright/test';
import { LoginComponent } from './components/login_component';
import { TEST_USERS } from './fixtures/test_users';

test('Save to Collection requires authentication and opens dialog when logged in', async ({ page }) => {
  const loginComponent = new LoginComponent(page);
  await loginComponent.login(TEST_USERS.SARAH.email, TEST_USERS.SARAH.password);

  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  const firstCard = page.locator('[data-testid="restaurant-card"]').first();
  const restaurantName = await firstCard.locator('[data-testid="restaurant-name"]').textContent();

  const menuButton = firstCard.locator('[data-testid="quick-actions-menu-trigger"]');
  await menuButton.click();

  const menu = page.locator('[data-testid="quick-actions-menu"]');
  await expect(menu).toBeVisible();

  const saveOption = menu.locator('[role="menuitem"]', { hasText: 'Save to Collection' });
  await saveOption.click();

  await expect(menu).not.toBeVisible();

  const dialog = page.locator('[role="dialog"]', { hasText: 'Save to Collection' });
  await expect(dialog).toBeVisible();

  const dialogContent = await dialog.textContent();
  expect(dialogContent).toContain(restaurantName);
});
