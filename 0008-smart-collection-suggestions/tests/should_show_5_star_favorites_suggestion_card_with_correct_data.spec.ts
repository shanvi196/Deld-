import { test, expect } from "@playwright/test";
import { TEST_USER } from "./fixtures/test_users";
import { CollectionsPage } from "./pages/collections_page";
import { HomePage } from "./pages/home_page";

test.describe("Smart Collection Suggestions - 5-Star Favorites Card", () => {
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

  test("should show 5-Star Favorites suggestion card with correct data", async ({ page }) => {
    await collectionsPage.goto();
    await collectionsPage.waitForCollectionsGridToLoad();

    const suggestionCards = page.getByTestId("suggestion-card");
    const fiveStarCard = suggestionCards.filter({ hasText: /5-star favorites/i });

    await expect(fiveStarCard).toBeVisible();

    const createButton = fiveStarCard.getByTestId("create-suggestion-button");
    await expect(createButton).toBeVisible();
    await expect(createButton).toBeEnabled();

    const restaurantCountText = await fiveStarCard.getByTestId("suggestion-card-restaurant-count").or(fiveStarCard.getByText(/\d+\s*restaurant/i)).textContent();
    const countMatch = restaurantCountText?.match(/(\d+)/);
    expect(countMatch).toBeTruthy();
    const count = parseInt(countMatch![1], 10);
    expect(count).toBeGreaterThanOrEqual(2);
  });
});