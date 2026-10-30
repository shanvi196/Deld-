import { test, expect } from '@playwright/test';

test('Navigate backward through quiz questions', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  await page.getByTestId('discover-cuisines-button').click();
  await expect(page.getByTestId('cuisine-quiz-dialog')).toBeVisible();

  await page.getByTestId('quiz-answer-Spicy').check();
  await page.getByTestId('quiz-next-button').click();

  await expect(page.getByRole('heading', { name: 'Dietary preference?' })).toBeVisible();
  await page.getByTestId('quiz-answer-Vegan').check();
  await page.getByTestId('quiz-next-button').click();

  await expect(page.getByRole('heading', { name: 'Preferred dining atmosphere?' })).toBeVisible();
  await page.getByTestId('quiz-back-button').click();

  await expect(page.getByRole('heading', { name: 'Dietary preference?' })).toBeVisible();
  await expect(page.locator('text="2 of 3"')).toBeVisible();
  await expect(page.getByTestId('quiz-answer-Vegan')).toBeChecked();
  await expect(page.getByTestId('quiz-next-button')).toBeEnabled();
});
