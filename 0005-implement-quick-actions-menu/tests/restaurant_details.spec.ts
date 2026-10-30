import { test } from "@playwright/test";
import { TEST_USER } from "./fixtures/test_users";
import { HomePage } from "./pages/home_page";
import { RestaurantDetailsPage } from "./pages/restaurant_details_page";

const TEST_RESTAURANT_ID = "25047088-5a40-4fab-be5c-3ee9a54fb980";

test.describe("Restaurant Details Page", () => {
  let homePage: HomePage;
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    restaurantDetailsPage = new RestaurantDetailsPage(page);

    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();

    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
  });

  test.afterEach(async ({ page }) => {
    console.log("=== CLEANUP: Starting afterEach hook ===");
    await restaurantDetailsPage.page.waitForTimeout(1000);

    try {
      const baseUrl = new URL(page.url()).origin;
      console.log(`CLEANUP: Base URL: ${baseUrl}`);
      console.log(`CLEANUP: Fetching review for restaurant ${TEST_RESTAURANT_ID}`);
      const findResponse = await page.request.get(
        `${baseUrl}/api/reviews/find-by-restaurant?restaurantId=${TEST_RESTAURANT_ID}`
      );

      console.log(`CLEANUP: Response status: ${findResponse.status()}`);
      console.log(`CLEANUP: Response ok: ${findResponse.ok()}`);

      if (findResponse.ok()) {
        const data = await findResponse.json();
        console.log("CLEANUP: Response data:", JSON.stringify(data, null, 2));

        const reviewId = data.data?.review?.id;
        console.log(`CLEANUP: Extracted reviewId: ${reviewId}`);

        if (reviewId) {
          console.log(`CLEANUP: Attempting to delete review: ${reviewId}`);
          const deleteResponse = await page.request.delete(`${baseUrl}/api/reviews?reviewId=${reviewId}`);
          console.log(`CLEANUP: Delete status: ${deleteResponse.status()}`);
          console.log(`CLEANUP: Delete ok: ${deleteResponse.ok()}`);

          if (deleteResponse.ok()) {
            console.log("CLEANUP: Review successfully deleted");
          } else {
            const deleteText = await deleteResponse.text();
            console.log(`CLEANUP: Delete failed with status ${deleteResponse.status()}`);
            console.log(`CLEANUP: Delete response body:`, deleteText);
            try {
              const deleteData = JSON.parse(deleteText);
              console.log("CLEANUP: Delete error data:", JSON.stringify(deleteData, null, 2));
            } catch {
              console.log("CLEANUP: Response was not JSON");
            }
          }
        } else {
          console.log("CLEANUP: No reviewId found, nothing to delete");
        }
      } else {
        const errorText = await findResponse.text();
        console.log(`CLEANUP: Find request failed with status ${findResponse.status()}`);
        console.log(`CLEANUP: Find response body:`, errorText);
      }
    } catch (error) {
      console.error("CLEANUP: Error occurred:", error);
    }

    console.log("=== CLEANUP: Finished afterEach hook ===");
  });

  test.describe("Write Review", () => {
    test("should navigate to write review page and submit a new review", async () => {
      await restaurantDetailsPage.expectWriteReviewButtonToBeVisible();

      await restaurantDetailsPage.clickWriteReview();

      await restaurantDetailsPage.expectToBeOnReviewPage(TEST_RESTAURANT_ID);

      await restaurantDetailsPage.selectRating(5);

      await restaurantDetailsPage.fillReviewText(
        "Amazing restaurant! The food was excellent and the service was outstanding. Highly recommend!"
      );

      await restaurantDetailsPage.expectReviewTextareaValue(
        "Amazing restaurant! The food was excellent and the service was outstanding. Highly recommend!"
      );

      await restaurantDetailsPage.submitReview();

      await restaurantDetailsPage.expectToBeBackOnRestaurantPage(TEST_RESTAURANT_ID);
    });

    test("should be able to fill review form with different ratings", async () => {
      await restaurantDetailsPage.clickWriteReview();

      await restaurantDetailsPage.expectToBeOnReviewPage(TEST_RESTAURANT_ID);

      await restaurantDetailsPage.selectRating(3);

      await restaurantDetailsPage.fillReviewText("It was okay. Nothing special but not bad either.");

      await restaurantDetailsPage.expectReviewTextareaValue("It was okay. Nothing special but not bad either.");
    });
  });

  test.describe("Edit Review", () => {
    test("should edit star rating of an existing review", async ({ page }) => {
      await restaurantDetailsPage.clickWriteReview();

      await restaurantDetailsPage.expectToBeOnReviewPage(TEST_RESTAURANT_ID);

      await restaurantDetailsPage.selectRating(3);

      await restaurantDetailsPage.fillReviewText(
        "Initial review with average rating. The experience was okay but nothing particularly stood out to me."
      );

      await restaurantDetailsPage.submitReview();

      await restaurantDetailsPage.expectToBeBackOnRestaurantPage(TEST_RESTAURANT_ID);

      await restaurantDetailsPage.page.waitForTimeout(2000);

      await restaurantDetailsPage.expectEditReviewButtonToBeVisible();

      await restaurantDetailsPage.clickEditReview();

      const baseUrl = new URL(page.url()).origin;
      const findResponse = await page.request.get(
        `${baseUrl}/api/reviews/find-by-restaurant?restaurantId=${TEST_RESTAURANT_ID}`
      );
      const data = await findResponse.json();
      const reviewId = data.data?.review?.id;

      await restaurantDetailsPage.expectToBeOnEditReviewPage(reviewId);

      await restaurantDetailsPage.expectRatingLabelText("OK");

      await restaurantDetailsPage.selectRating(5);

      await restaurantDetailsPage.expectRatingLabelText("Great");

      await restaurantDetailsPage.submitEditedReview();

      await restaurantDetailsPage.expectToBeBackOnRestaurantPage(TEST_RESTAURANT_ID);
    });

    test("should edit review text successfully", async ({ page }) => {
      await restaurantDetailsPage.clickWriteReview();

      await restaurantDetailsPage.expectToBeOnReviewPage(TEST_RESTAURANT_ID);

      await restaurantDetailsPage.selectRating(4);

      await restaurantDetailsPage.fillReviewText(
        "Good restaurant with decent food. The service was friendly and the atmosphere was nice and cozy."
      );

      await restaurantDetailsPage.submitReview();

      await restaurantDetailsPage.expectToBeBackOnRestaurantPage(TEST_RESTAURANT_ID);

      await restaurantDetailsPage.page.waitForTimeout(2000);

      await restaurantDetailsPage.clickEditReview();

      const baseUrl = new URL(page.url()).origin;
      const findResponse = await page.request.get(
        `${baseUrl}/api/reviews/find-by-restaurant?restaurantId=${TEST_RESTAURANT_ID}`
      );
      const data = await findResponse.json();
      const reviewId = data.data?.review?.id;

      await restaurantDetailsPage.expectToBeOnEditReviewPage(reviewId);

      const updatedReviewText =
        "Updated review: Excellent restaurant! After my second visit, I must say the food quality is outstanding. The chef really knows their craft and the presentation is beautiful.";

      await restaurantDetailsPage.clearReviewText();
      await restaurantDetailsPage.fillReviewText(updatedReviewText);

      await restaurantDetailsPage.expectReviewTextareaValue(updatedReviewText);

      await restaurantDetailsPage.submitEditedReview();

      await restaurantDetailsPage.expectToBeBackOnRestaurantPage(TEST_RESTAURANT_ID);
    });

    test("should block submission when review text is cleared to 0 characters", async ({ page }) => {
      await restaurantDetailsPage.clickWriteReview();

      await restaurantDetailsPage.expectToBeOnReviewPage(TEST_RESTAURANT_ID);

      await restaurantDetailsPage.selectRating(4);

      await restaurantDetailsPage.fillReviewText(
        "Great place with amazing food. The staff was attentive and the ambiance was perfect for a dinner date."
      );

      await restaurantDetailsPage.submitReview();

      await restaurantDetailsPage.expectToBeBackOnRestaurantPage(TEST_RESTAURANT_ID);

      await restaurantDetailsPage.page.waitForTimeout(2000);

      await restaurantDetailsPage.clickEditReview();

      const baseUrl = new URL(page.url()).origin;
      const findResponse = await page.request.get(
        `${baseUrl}/api/reviews/find-by-restaurant?restaurantId=${TEST_RESTAURANT_ID}`
      );
      const data = await findResponse.json();
      const reviewId = data.data?.review?.id;

      await restaurantDetailsPage.expectToBeOnEditReviewPage(reviewId);

      await restaurantDetailsPage.clearReviewText();

      await restaurantDetailsPage.expectReviewTextareaValue("");

      await restaurantDetailsPage.submitEditedReview();

      await restaurantDetailsPage.expectReviewTextError();

      await restaurantDetailsPage.expectToBeOnEditReviewPage(reviewId);
    });
  });

  test.describe("Save to Collection", () => {
    test("should save restaurant to a new collection", async ({ page }) => {
      await restaurantDetailsPage.clickSaveButton();

      await page.waitForTimeout(500);

      const newCollectionButton = page.getByRole("button", {
        name: /save to a new collection/i
      });
      await newCollectionButton.click();

      const collectionName = `Test Collection ${Date.now()}`;
      await restaurantDetailsPage.createNewCollection(collectionName);

      await page.waitForTimeout(1000);

      await restaurantDetailsPage.expectSaveButtonToShow("Saved");
    });

    test("should toggle save button when clicking it", async () => {
      const initialText = await restaurantDetailsPage.restaurantSaveButton.textContent();

      await restaurantDetailsPage.clickSaveButton();

      await restaurantDetailsPage.page.waitForTimeout(1000);

      if (initialText?.includes("Save")) {
        await restaurantDetailsPage.expectSaveButtonToShow("Saved");
      } else {
        await restaurantDetailsPage.expectSaveButtonToShow("Save");
      }
    });
  });

  test.describe("Amenities Section", () => {
    test("should display all amenities when clicking show more and hide with show less", async () => {
      await restaurantDetailsPage.scrollToReviews();

      await restaurantDetailsPage.page.evaluate(() => window.scrollTo(0, 0));

      const initialCount = await restaurantDetailsPage.getAmenitiesCount();

      await restaurantDetailsPage.expectShowMoreButtonText("more");

      await restaurantDetailsPage.clickShowMoreAmenities();

      const expandedCount = await restaurantDetailsPage.getAmenitiesCount();

      test.expect(expandedCount).toBeGreaterThan(initialCount);

      await restaurantDetailsPage.expectShowMoreButtonText("Show less");

      await restaurantDetailsPage.clickShowMoreAmenities();

      const collapsedCount = await restaurantDetailsPage.getAmenitiesCount();

      test.expect(collapsedCount).toBe(initialCount);

      await restaurantDetailsPage.expectShowMoreButtonText("more");
    });

    test("should verify specific amenities are displayed", async () => {
      await restaurantDetailsPage.clickShowMoreAmenities();

      await restaurantDetailsPage.expectAmenityToBeVisible("wifi");
    });
  });

  test.describe("Reviews Display", () => {
    test("should display reviews section with overall rating", async () => {
      await restaurantDetailsPage.scrollToReviews();

      await restaurantDetailsPage.expectReviewsToBeVisible();

      await restaurantDetailsPage.expectOverallRatingToBeVisible();

      await restaurantDetailsPage.expectReviewsCountToContain("review");
    });

    test("should display rating distribution bars", async () => {
      await restaurantDetailsPage.scrollToReviews();

      await restaurantDetailsPage.expectRatingDistributionToBeVisible();

      await restaurantDetailsPage.expectRatingBarToBeVisible(5);
      await restaurantDetailsPage.expectRatingBarToBeVisible(4);
      await restaurantDetailsPage.expectRatingBarToBeVisible(3);
      await restaurantDetailsPage.expectRatingBarToBeVisible(2);
      await restaurantDetailsPage.expectRatingBarToBeVisible(1);
    });

    test("should close reviews alert when clicking close button", async () => {
      await restaurantDetailsPage.scrollToReviews();

      const alertVisible = await restaurantDetailsPage.reviewsAlert.isVisible();

      if (alertVisible) {
        await restaurantDetailsPage.closeReviewsAlert();

        await restaurantDetailsPage.expectReviewsAlertToBeClosed();
      }
    });
  });

  test.describe("Reviews Pagination", () => {
    test("should navigate through review pages using next button", async () => {
      await restaurantDetailsPage.scrollToReviews();

      await restaurantDetailsPage.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const nextButtonEnabled = await restaurantDetailsPage.reviewsPaginationNext.isEnabled();

      if (nextButtonEnabled) {
        await restaurantDetailsPage.expectReviewsPaginationPageToBeActive(1);

        await restaurantDetailsPage.clickReviewsNextPage();

        await restaurantDetailsPage.expectReviewsPaginationPageToBeActive(2);

        await restaurantDetailsPage.expectReviewsPreviousButtonToBeEnabled();
      }
    });

    test("should navigate through review pages using page number buttons", async () => {
      await restaurantDetailsPage.scrollToReviews();

      await restaurantDetailsPage.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const page3Button = restaurantDetailsPage.getReviewsPaginationPageButton(3);
      const page3Exists = (await page3Button.count()) > 0;

      if (page3Exists) {
        await restaurantDetailsPage.clickReviewsPaginationPage(3);

        await restaurantDetailsPage.expectReviewsPaginationPageToBeActive(3);

        await restaurantDetailsPage.expectReviewsPreviousButtonToBeEnabled();
      }
    });

    test("should navigate to next page and back to previous page", async () => {
      await restaurantDetailsPage.scrollToReviews();

      await restaurantDetailsPage.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const nextButtonEnabled = await restaurantDetailsPage.reviewsPaginationNext.isEnabled();

      if (nextButtonEnabled) {
        await restaurantDetailsPage.expectReviewsPaginationPageToBeActive(1);

        await restaurantDetailsPage.clickReviewsNextPage();

        await restaurantDetailsPage.expectReviewsPaginationPageToBeActive(2);

        await restaurantDetailsPage.clickReviewsPreviousPage();

        await restaurantDetailsPage.expectReviewsPaginationPageToBeActive(1);

        await restaurantDetailsPage.expectReviewsPreviousButtonToBeDisabled();
      }
    });

    test("should display pagination info correctly", async () => {
      await restaurantDetailsPage.scrollToReviews();

      await restaurantDetailsPage.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      await restaurantDetailsPage.expectReviewsPaginationInfoToContain("of");
    });
  });

  test.describe("Page Structure", () => {
    test("should display left and right panels", async () => {
      await restaurantDetailsPage.expectLeftPanelToBeVisible();

      await restaurantDetailsPage.expectRightPanelToBeVisible();
    });

    test("should display location and hours section", async () => {
      await restaurantDetailsPage.page.evaluate(() => window.scrollTo(0, 500));

      await restaurantDetailsPage.page.waitForTimeout(500);

      const locationSectionVisible = await restaurantDetailsPage.locationHoursSection.isVisible();

      test.expect(locationSectionVisible).toBe(true);
    });
  });
});
