import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/home_page";
import { TEST_USER } from "./fixtures/test_users";

test.describe("Quick Rating - Error handling", () => {
  test("should show error toast when rating submission fails", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    await page.route("**/api/reviews", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ success: false, message: "Server error" })
      });
    });
    
    const firstCard = homePage.restaurantCards.first();
    await firstCard.hover();
    await page.waitForTimeout(300);
    
    await firstCard.getByTestId("quick-rating-star-4").click();

    
    const dialog = page.getByTestId("quick-rating-dialog");
    await expect(dialog).toBeVisible();
    
    await page.getByTestId("quick-rating-confirm").click();
    
    await expect(page.getByText("Failed to submit rating. Please try again.")).toBeVisible({ timeout: 5000 });
    
    await expect(dialog).toBeVisible();
    
    await expect(page.getByTestId("quick-rating-confirm")).toBeEnabled();
  });
});