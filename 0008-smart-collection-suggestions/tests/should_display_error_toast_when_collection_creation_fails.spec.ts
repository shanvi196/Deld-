import { test, expect } from "@playwright/test";
import { TEST_USER } from "./fixtures/test_users";
import { CollectionsPage } from "./pages/collections_page";
import { HomePage } from "./pages/home_page";

test.describe("Smart Collection Suggestions - Network Error", () => {
  let homePage: HomePage;
  let collectionsPage: CollectionsPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    collectionsPage = new CollectionsPage(page);

    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
  });

  test("should display error toast when collection creation fails", async ({ page }) => {
    await collectionsPage.goto();
    await collectionsPage.waitForCollectionsGridToLoad();

    await page.route("**/api/collections", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ success: false, message: "Internal Server Error" })
        });
      } else {
        await route.continue();
      }
    });

    const suggestionCards = page.getByTestId("suggestion-card");
    const firstCard = suggestionCards.first();
    await expect(firstCard).toBeVisible();

    const createButton = firstCard.getByTestId("create-suggestion-button");
    await createButton.click();

    const loadingIndicator = page.getByTestId("create-suggestion-loading");
    await expect(loadingIndicator).toBeVisible({ timeout: 5000 });

    const errorToast = page.getByText(/failed to create collection/i);
    await expect(errorToast).toBeVisible({ timeout: 10000 });

    await expect(firstCard).toBeVisible();

    await expect(createButton).toBeEnabled({ timeout: 5000 });
  });
});