import { test } from "@playwright/test";
import { HomePage } from "./pages/home_page";

test.describe("Homepage navigation and search functionality", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test.describe("Pagination navigation", () => {
    test("should navigate to next page and verify URL", async () => {
      await homePage.expectPaginationPageToBeActive(1);

      await homePage.expectPreviousButtonToBeDisabled();

      await homePage.clickNextPage();

      await homePage.expectUrlToContainPage(2);

      await homePage.expectPaginationPageToBeActive(2);

      await homePage.expectPreviousButtonToBeEnabled();
    });

    test("should navigate to next page and back to previous page", async () => {
      await homePage.expectPaginationPageToBeActive(1);

      await homePage.clickNextPage();

      await homePage.expectUrlToContainPage(2);
      await homePage.expectPaginationPageToBeActive(2);

      await homePage.clickPreviousPage();

      await homePage.expectUrlToBeFirstPage();
      await homePage.expectPaginationPageToBeActive(1);

      await homePage.expectPreviousButtonToBeDisabled();
    });

    test("should navigate using page number buttons", async () => {
      await homePage.expectPaginationPageToBeActive(1);

      await homePage.clickPaginationPage(3);

      await homePage.expectUrlToContainPage(3);
      await homePage.expectPaginationPageToBeActive(3);

      await homePage.expectPreviousButtonToBeEnabled();
    });

    test("should navigate using next page button", async () => {
      await homePage.expectPaginationPageToBeActive(1);

      await homePage.clickNextPageButton();

      await homePage.expectUrlToContainPage(2);
      await homePage.expectPaginationPageToBeActive(2);
    });

    test("should scroll to top when navigating to next page", async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, 500));

      await homePage.clickNextPage();

      await page.waitForTimeout(500);

      await homePage.expectPageToBeScrolledToTop();
    });
  });

  test.describe("Search functionality", () => {
    test("should search by query only", async () => {
      await homePage.fillSearchQuery("pizza");

      await homePage.waitForSearchDebounce();

      await homePage.expectUrlToContainSearchParams("pizza", undefined);

      await homePage.expectSearchQueryValue("pizza");
    });

    test("should search by location only", async () => {
      await homePage.fillSearchLocation("New York, NY");

      await homePage.waitForSearchDebounce();

      await homePage.expectUrlToContainSearchParams(undefined, "New York, NY");

      await homePage.expectSearchLocationValue("New York, NY");
    });

    test("should search by both query and location", async () => {
      await homePage.fillSearchQuery("sushi");

      await homePage.fillSearchLocation("Los Angeles, CA");

      await homePage.waitForSearchDebounce();

      await homePage.expectUrlToContainSearchParams("sushi", "Los Angeles, CA");

      await homePage.expectSearchQueryValue("sushi");
      await homePage.expectSearchLocationValue("Los Angeles, CA");
    });

    test("should clear search query and update results", async () => {
      await homePage.fillSearchQuery("burgers");

      await homePage.waitForSearchDebounce();

      await homePage.expectUrlToContainSearchParams("burgers", undefined);

      await homePage.fillSearchQuery("");

      await homePage.waitForSearchDebounce();

      await homePage.expectSearchQueryValue("");
    });

    test("should update location and maintain existing query", async () => {
      await homePage.fillSearchQuery("italian");

      await homePage.waitForSearchDebounce();

      await homePage.expectUrlToContainSearchParams("italian", undefined);

      await homePage.fillSearchLocation("Chicago, IL");

      await homePage.waitForSearchDebounce();

      await homePage.expectUrlToContainSearchParams("italian", "Chicago, IL");

      await homePage.expectSearchQueryValue("italian");
      await homePage.expectSearchLocationValue("Chicago, IL");
    });
  });

  test.describe("Combined pagination and search", () => {
    test("should maintain search params when navigating pages", async () => {
      await homePage.fillSearchLocation("houston");

      await homePage.waitForSearchDebounce();

      await homePage.expectUrlToContainSearchParams(undefined, "houston");

      await homePage.clickNextPageButton();

      await homePage.expectUrlToContainPage(2);
      await homePage.expectUrlToContainSearchParams(undefined, "houston");

      await homePage.expectSearchLocationValue("houston");
    });
  });

  test.describe("Restaurant navigation", () => {
    test("should navigate to restaurant detail page when clicking on first restaurant card", async () => {
      await homePage.expectRestaurantCardsToBeVisible();

      const restaurantId = await homePage.getRestaurantIdFromCard(0);

      await homePage.clickFirstRestaurantCard();

      await homePage.expectToBeOnRestaurantPage(restaurantId);
    });

    test("should navigate to restaurant detail page when clicking on any restaurant card", async () => {
      await homePage.expectRestaurantCardsToBeVisible();

      await homePage.clickRestaurantCardByIndex(2);

      await homePage.expectToBeOnAnyRestaurantPage();
    });

    test("should display multiple restaurant cards on homepage", async () => {
      await homePage.expectRestaurantCardsToBeVisible();

      await homePage.expectRestaurantCardCount(10);
    });
  });
});
