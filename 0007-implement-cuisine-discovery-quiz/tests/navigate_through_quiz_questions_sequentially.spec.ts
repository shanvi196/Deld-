import { test, expect } from '@playwright/test';

test('Navigate through quiz questions sequentially', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  await page.getByTestId('discover-cuisines-button').click();
  await expect(page.getByTestId('cuisine-quiz-dialog')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'How spicy do you like your food?' })).toBeVisible();

  await page.getByTestId('quiz-answer-Medium').check();
  await page.getByTestId('quiz-next-button').click();

  await expect(page.getByRole('heading', { name: 'Dietary preference?' })).toBeVisible();
  await expect(page.locator('text="2 of 3"')).toBeVisible();

  const radioButtons = page.locator('input[type="radio"]');
  await expect(radioButtons).toHaveCount(4);

  await expect(page.getByTestId('quiz-next-button')).toBeDisabled();
  await expect(page.getByTestId('quiz-back-button')).toBeVisible();

  const checkedRadios = page.locator('input[type="radio"]:checked');
  await expect(checkedRadios).toHaveCount(0);
});
