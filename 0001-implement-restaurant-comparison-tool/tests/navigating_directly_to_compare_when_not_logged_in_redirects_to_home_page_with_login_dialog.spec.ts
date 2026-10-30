import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('Navigating directly to /compare when not logged in redirects to home page with login dialog', async ({ page }) => {
  const homePage = new HomePage(page);

  await page.goto('http://localhost:3000/compare');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('comparison-table')).not.toBeVisible();

  const keys = await page.evaluate(() => {
    return Object.keys(localStorage).filter(k => k.startsWith('comparisonList-'));
  });
  expect(keys.length).toBe(0);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();
  await page.waitForTimeout(1000);

  await page.goto('http://localhost:3000/compare');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  expect(page.url()).toContain('/compare');

  await expect(page.getByText('Select restaurants to compare')).toBeVisible();

  await expect(page.getByTestId('comparison-empty-back-link')).toBeVisible();
  const backLinkHref = await page.getByTestId('comparison-empty-back-link').getAttribute('href');
  expect(backLinkHref).toBe('/');
});