import { test, expect } from "@playwright/test";
import { TEST_USER } from "./fixtures/test_users";
import { CollectionsPage } from "./pages/collections_page";
import { HomePage } from "./pages/home_page";

test.describe("Smart Collection Suggestions - Display Section", () => {
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

  test("should display suggested collections section when user has qualifying reviews", async ({ page }) => {
    await collectionsPage.goto();
    await collectionsPage.waitForCollectionsGridToLoad();

    const suggestedSection = page.getByTestId("suggested-collections-section");
    await expect(suggestedSection).toBeVisible();

    const sectionHeading = suggestedSection.getByRole("heading", { name: /suggested for you/i });
    await expect(sectionHeading).toBeVisible();

    const suggestionCards = page.getByTestId("suggestion-card");
    const cardCount = await suggestionCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(1);

    const firstCard = suggestionCards.first();
    await expect(firstCard.getByTestId("suggestion-card-name").or(firstCard.getByRole("heading"))).toBeVisible();

    const restaurantCount = firstCard.getByTestId("suggestion-card-restaurant-count").or(firstCard.getByText(/\d+\s*restaurant/i));
    await expect(restaurantCount).toBeVisible();
  });
});