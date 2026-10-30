import { test, expect } from '@playwright/test';

test('Complete quiz and view recommended cuisines', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  await page.getByTestId('discover-cuisines-button').click();
  await expect(page.getByTestId('cuisine-quiz-dialog')).toBeVisible();

  await page.getByTestId('quiz-answer-Spicy').check();
  await page.getByTestId('quiz-next-button').click();

  await page.getByTestId('quiz-answer-Vegetarian').check();
  await page.getByTestId('quiz-next-button').click();

  await page.getByTestId('quiz-answer-Casual').check();
  await page.getByTestId('quiz-next-button').click();

  await expect(page.getByRole('heading', { name: 'Recommended Cuisines for You' })).toBeVisible();

  const cuisineCards = page.locator('[data-testid^="cuisine-card-"]');
  await expect(cuisineCards).toHaveCount(3);

  for (let i = 0; i < 3; i++) {
    const card = cuisineCards.nth(i);
    await expect(card.locator('h3, h4')).toBeVisible();
    await expect(card.locator('p')).toBeVisible();
    await expect(page.getByTestId(`search-cuisine-button-${i}`)).toBeVisible();
  }

  await expect(page.getByTestId('retake-quiz-button')).toBeVisible();
  await expect(page.getByTestId('quiz-dialog-close')).toBeVisible();
});
