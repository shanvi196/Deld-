import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/home_page";

test.describe("Quick Rating - Hide overlay when logged out", () => {
  test("should NOT show quick rating overlay when logged out", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.expectLoginButtonToBeVisible();
    
    const firstCard = homePage.restaurantCards.first();
    await firstCard.hover();
    await page.waitForTimeout(500);
    
    const overlay = page.getByTestId("quick-rating-overlay");
    await expect(overlay).not.toBeVisible();
    
    await expect(firstCard).toBeVisible();
  });
});