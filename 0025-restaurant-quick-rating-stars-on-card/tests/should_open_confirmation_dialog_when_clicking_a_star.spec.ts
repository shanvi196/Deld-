import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/home_page";
import { TEST_USER } from "./fixtures/test_users";

test.describe("Quick Rating - Open confirmation dialog", () => {
  test("should open confirmation dialog when clicking a star", async ({ page }) => {
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
    
    await firstCard.getByTestId("quick-rating-star-4").click();

    const dialog = page.getByTestId("quick-rating-dialog");
    await expect(dialog).toBeVisible();
    
    await expect(page.getByTestId("quick-rating-confirm")).toBeVisible();
    await expect(page.getByTestId("quick-rating-confirm")).toContainText("Submit Rating");
    
    await expect(page.getByTestId("quick-rating-cancel")).toBeVisible();
    await expect(page.getByTestId("quick-rating-cancel")).toContainText("Cancel");
  });
});