import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('should move note card between Pinned and All Notes sections when toggling pin on My Notes page and update header indicators', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await page.evaluate((email) => {
    const notes = {};
    notes[email] = {
      'cafe-luna': { text: 'Great coffee here', pinned: true, createdAt: '2024-06-16T12:00:00.000Z', updatedAt: '2024-06-16T12:00:00.000Z' },
      'burger-barn': { text: 'Best burgers in town', pinned: false, createdAt: '2024-06-15T10:00:00.000Z', updatedAt: '2024-06-15T10:00:00.000Z' },
      'taco-town': { text: 'Authentic tacos', pinned: false, createdAt: '2024-06-14T08:00:00.000Z', updatedAt: '2024-06-14T08:00:00.000Z' }
    };
    localStorage.setItem('restaurant-notes', JSON.stringify(notes));
  }, TEST_USER.email);

  await page.goto('http://localhost:3000/user/notes');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const pinnedSection = page.getByTestId('pinned-notes-section');
  await expect(pinnedSection).toBeVisible();
  await expect(pinnedSection.locator('[data-testid^="note-card-"]')).toHaveCount(1);

  const allNotesSection = page.getByTestId('all-notes-section');
  await expect(allNotesSection.locator('[data-testid^="note-card-"]')).toHaveCount(2);

  await expect(page.getByTestId('pinned-count-indicator')).toHaveText('1');

  await page.getByTestId('note-card-pin-burger-barn').click();
  await page.waitForTimeout(500);

  await expect(pinnedSection.locator('[data-testid="note-card-burger-barn"]')).toBeVisible();
  await expect(pinnedSection.locator('[data-testid^="note-card-"]')).toHaveCount(2);
  await expect(allNotesSection.locator('[data-testid^="note-card-"]')).toHaveCount(1);
  await expect(page.getByTestId('pinned-count-indicator')).toHaveText('2');

  await page.getByTestId('note-card-pin-cafe-luna').click();
  await page.waitForTimeout(500);

  await expect(allNotesSection.locator('[data-testid="note-card-cafe-luna"]')).toBeVisible();
  await expect(pinnedSection.locator('[data-testid^="note-card-"]')).toHaveCount(1);
  await expect(page.getByTestId('pinned-count-indicator')).toHaveText('1');
});