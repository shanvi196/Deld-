import { test, expect } from "@playwright/test";
import { TEST_USER } from "./fixtures/test_users";
import { CollectionsPage } from "./pages/collections_page";
import { HomePage } from "./pages/home_page";

test.describe("Smart Collection Suggestions - Grid Update", () => {
  let homePage: HomePage;
  let collectionsPage: CollectionsPage;
  const createdCollectionNames: string[] = [];

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    collectionsPage = new CollectionsPage(page);

    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
  });

  test.afterEach(async ({ page }) => {
    await page.waitForTimeout(1000);
    try {
      const baseUrl = new URL(page.url()).origin;
      for (const collectionName of createdCollectionNames) {
        const collectionsResponse = await page.request.get(`${baseUrl}/api/collections`);
        if (collectionsResponse.ok()) {
          const collectionsData = await collectionsResponse.json();
          const collection = collectionsData.data?.collections?.find((c: { name: string }) => c.name === collectionName);
          if (collection?.id) {
            await page.request.delete(`${baseUrl}/api/collections?collectionId=${collection.id}`);
          }
        }
      }
      createdCollectionNames.length = 0;
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  });

  test("should update collections grid immediately without page refresh", async ({ page }) => {
    await collectionsPage.goto();
    await collectionsPage.waitForCollectionsGridToLoad();

    const collectionTiles = page.getByTestId("collection-tile").or(page.getByTestId("collection-tile-name"));
    const initialCollectionCount = await collectionTiles.count();

    const suggestionCards = page.getByTestId("suggestion-card");
    const fiveStarCard = suggestionCards.filter({ hasText: /5-star favorites/i }).first();
    await expect(fiveStarCard).toBeVisible();

    createdCollectionNames.push("5-Star Favorites");

    const remainingCardsBeforeClick = await suggestionCards.count();

    const createButton = fiveStarCard.getByTestId("create-suggestion-button");
    await createButton.click();

    const toast = page.getByText(/collection created/i);
    await expect(toast).toBeVisible({ timeout: 10000 });

    await page.waitForTimeout(1000);

    const finalCollectionCount = await collectionTiles.count();
    expect(finalCollectionCount).toBe(initialCollectionCount + 1);

    const newCollectionTile = page.getByTestId("collection-tile-name").filter({ hasText: /5-star favorites/i });
    await expect(newCollectionTile).toBeVisible();

    await expect(fiveStarCard).not.toBeVisible();

    const remainingCardsAfterClick = await suggestionCards.count();
    expect(remainingCardsAfterClick).toBe(remainingCardsBeforeClick - 1);
  });
});