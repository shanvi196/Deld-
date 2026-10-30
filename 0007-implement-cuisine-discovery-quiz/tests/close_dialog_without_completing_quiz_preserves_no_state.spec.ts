import { test, expect } from '@playwright/test';

test('Close dialog without completing quiz preserves no state', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  await page.getByTestId('discover-cuisines-button').click();
  await expect(page.getByTestId('cuisine-quiz-dialog')).toBeVisible();

  await page.getByTestId('quiz-answer-Medium').check();
  await page.getByTestId('quiz-next-button').click();
  await expect(page.getByRole('heading', { name: 'Dietary preference?' })).toBeVisible();

  await page.getByTestId('quiz-answer-Vegetarian').check();

  await page.getByTestId('quiz-dialog-close').click();
  await expect(page.getByTestId('cuisine-quiz-dialog')).not.toBeVisible();

  await page.getByTestId('discover-cuisines-button').click();
  await expect(page.getByTestId('cuisine-quiz-dialog')).toBeVisible();

  await expect(page.getByRole('heading', { name: 'How spicy do you like your food?' })).toBeVisible();
  await expect(page.locator('text="1 of 3"')).toBeVisible();

  const checkedRadios = page.locator('input[type="radio"]:checked');
  await expect(checkedRadios).toHaveCount(0);
});
