import { test, expect } from "@playwright/test";
import { CollectionsPage } from "./pages/collections_page";
import { HomePage } from "./pages/home_page";

const NO_REVIEWS_USER = {
  email: "morgan.chambers@email.com",
  password: "password123"
};

test.describe("Smart Collection Suggestions - No Reviews User", () => {
  let homePage: HomePage;
  let collectionsPage: CollectionsPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    collectionsPage = new CollectionsPage(page);

    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(NO_REVIEWS_USER.email, NO_REVIEWS_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
  });

  test("should hide suggestions section when user has no reviews", async ({ page }) => {
    await collectionsPage.goto();
    await collectionsPage.waitForCollectionsGridToLoad();

    const suggestedSection = page.getByTestId("suggested-collections-section");
    await expect(suggestedSection).not.toBeVisible();

    const collectionsGrid = page.getByTestId("collections-grid");
    await expect(collectionsGrid).toBeVisible();

    const createCollectionButton = page.getByTestId("create-collection-button");
    await expect(createCollectionButton).toBeVisible();
  });
});