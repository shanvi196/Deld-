import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('Removing an active cuisine from modal also removes it from URL categories param on save', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await page.evaluate(() => {
    localStorage.setItem('deld-cuisine-prefs-user_0001', JSON.stringify({
      cuisines: ['italian', 'thai', 'japanese'],
      updatedAt: '2024-01-15T14:20:00.000Z'
    }));
  });

  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await page.getByTestId('cuisine-chip-thai').click();
  await page.waitForTimeout(1000);

  expect(new URL(page.url()).searchParams.get('categories') || '').toContain('thai');
  await expect(page.getByTestId('cuisine-chip-thai')).toHaveAttribute('aria-pressed', 'true');

  await page.getByTestId('customize-cuisines-btn').click();
  await page.waitForTimeout(500);

  await page.getByTestId('remove-cuisine-thai').click();
  await page.waitForTimeout(500);

  await page.getByTestId('save-cuisine-prefs').click();
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('cuisine-prefs-modal')).not.toBeVisible();

  expect(new URL(page.url()).searchParams.get('categories') || '').not.toContain('thai');
  await expect(page.getByTestId('cuisine-chip-thai')).toHaveCount(0);
});