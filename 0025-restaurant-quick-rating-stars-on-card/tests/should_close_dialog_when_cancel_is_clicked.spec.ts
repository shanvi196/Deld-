import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/home_page";
import { TEST_USER } from "./fixtures/test_users";

test.describe("Quick Rating - Cancel dialog", () => {
  test("should close dialog when cancel is clicked", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    const firstCard = homePage.restaurantCards.first();
    await firstCard.hover();
    await page.waitForTimeout(300);
    
    await firstCard.getByTestId("quick-rating-star-3").click();

    const dialog = page.getByTestId("quick-rating-dialog");
    await expect(dialog).toBeVisible();
    
    await page.getByTestId("quick-rating-cancel").click();
    
    await expect(dialog).not.toBeVisible();
  });
});