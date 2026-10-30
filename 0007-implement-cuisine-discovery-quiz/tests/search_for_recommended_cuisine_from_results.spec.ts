import { test, expect } from '@playwright/test';

test('Search for recommended cuisine from results', async ({ page }) => {
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

  await page.getByTestId('search-cuisine-button-0').click();

  await expect(page.getByTestId('cuisine-quiz-dialog')).not.toBeVisible();
  await page.waitForURL('**/search**');
  expect(page.url()).toContain('categories=');

  const restaurantCards = page.locator('[data-testid^="restaurant-card-link-"]');
  expect(await restaurantCards.count()).toBeGreaterThan(0);
});
