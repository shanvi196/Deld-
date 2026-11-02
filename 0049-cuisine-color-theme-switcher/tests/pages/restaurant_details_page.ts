import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class RestaurantDetailsPage {
  public readonly page: Page;

  // Quick Action Buttons
  public readonly quickActionButtons: Locator;
  public readonly writeReviewButton: Locator;
  public readonly editReviewButton: Locator;
  public readonly restaurantSaveButton: Locator;
  public readonly restaurantSaveButtonGuest: Locator;

  // Recommend Business Section
  public readonly recommendBusinessSection: Locator;
  public readonly recommendYesButton: Locator;
  public readonly recommendNoButton: Locator;
  public readonly recommendMaybeButton: Locator;

  // Amenities Section
  public readonly amenitiesSection: Locator;
  public readonly amenitiesShowMoreButton: Locator;

  // Location & Hours Section
  public readonly locationHoursSection: Locator;
  public readonly addressBlock: Locator;
  public readonly openingHoursBlock: Locator;
  public readonly getDirectionsButton: Locator;

  // Recommended Reviews Section
  public readonly recommendedReviewsSection: Locator;
  public readonly reviewsAlert: Locator;
  public readonly reviewsAlertClose: Locator;
  public readonly overallRatingSection: Locator;
  public readonly reviewsCount: Locator;
  public readonly ratingDistribution: Locator;

  // Reviews List & Pagination
  public readonly reviewsPaginationPrevious: Locator;
  public readonly reviewsPaginationNext: Locator;
  public readonly paginationInfo: Locator;

  // Collection Dialog
  public readonly collectionNameInput: Locator;
  public readonly saveCollectionButton: Locator;
  public readonly closeNewCollectionDialogButton: Locator;

  // Write Review Form
  public readonly reviewTextarea: Locator;
  public readonly postReviewButton: Locator;
  public readonly updateReviewButton: Locator;
  public readonly ratingLabel: Locator;

  // Related Searches
  public readonly relatedSearchesSection: Locator;

  // Panels
  public readonly leftPanel: Locator;
  public readonly rightPanel: Locator;

  public constructor(page: Page) {
    this.page = page;

    // Quick Action Buttons
    this.quickActionButtons = page.getByTestId("quick-action-buttons");
    this.writeReviewButton = page.getByTestId("write-review-button");
    this.editReviewButton = page.getByTestId("edit-review-button");
    this.restaurantSaveButton = page.getByTestId("restaurant-save-button");
    this.restaurantSaveButtonGuest = page.getByTestId("restaurant-save-button-guest");

    // Recommend Business Section
    this.recommendBusinessSection = page.getByTestId("recommend-business-section");
    this.recommendYesButton = page.getByTestId("recommend-yes-button");
    this.recommendNoButton = page.getByTestId("recommend-no-button");
    this.recommendMaybeButton = page.getByTestId("recommend-maybe-button");

    // Amenities Section
    this.amenitiesSection = page.getByTestId("amenities-section");
    this.amenitiesShowMoreButton = page.getByTestId("amenities-show-more-button");

    // Location & Hours Section
    this.locationHoursSection = page.getByTestId("location-hours-section");
    this.addressBlock = page.getByTestId("address-block");
    this.openingHoursBlock = page.getByTestId("opening-hours-block");
    this.getDirectionsButton = page.getByTestId("get-directions-button");

    // Recommended Reviews Section
    this.recommendedReviewsSection = page.getByTestId("recommended-reviews-section");
    this.reviewsAlert = page.getByTestId("reviews-alert");
    this.reviewsAlertClose = page.getByTestId("reviews-alert-close");
    this.overallRatingSection = page.getByTestId("overall-rating-section");
    this.reviewsCount = page.getByTestId("reviews-count");
    this.ratingDistribution = page.getByTestId("rating-distribution");

    // Reviews List & Pagination
    this.reviewsPaginationPrevious = page.getByTestId("pagination-previous");
    this.reviewsPaginationNext = page.getByTestId("pagination-next");
    this.paginationInfo = page.getByTestId("pagination-info");

    // Collection Dialog
    this.collectionNameInput = page.getByTestId("collection-name-input");
    this.saveCollectionButton = page.getByTestId("save-collection-button");
    this.closeNewCollectionDialogButton = page.getByTestId("close-new-collection-dialog-button");

    // Write Review Form
    this.reviewTextarea = page.getByTestId("review-textarea");
    this.postReviewButton = page.getByTestId("post-review-button");
    this.updateReviewButton = page.getByTestId("update-review-button");
    this.ratingLabel = page.getByTestId("rating-label");

    // Related Searches
    this.relatedSearchesSection = page.getByTestId("related-searches-section");

    // Panels
    this.leftPanel = page.getByTestId("restaurant-left-panel");
    this.rightPanel = page.getByTestId("restaurant-right-panel");
  }

  public async goto(restaurantId: string): Promise<void> {
    await this.page.goto(`http://localhost:3000/restaurants/${restaurantId}`);
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Quick Actions Methods
  public async clickWriteReview(): Promise<void> {
    await this.page.waitForTimeout(1200);
    await this.page.waitForLoadState('domcontentloaded');
    await this.writeReviewButton.click();
    await this.page.waitForTimeout(4000);
  }

  public async clickEditReview(): Promise<void> {
    await this.page.waitForTimeout(1200);
    await this.page.waitForLoadState('domcontentloaded');
    await this.editReviewButton.click();
    await this.page.waitForTimeout(2000);
  }

  public async clickSaveButton(): Promise<void> {
    await this.restaurantSaveButton.click();
    await this.page.waitForTimeout(2000);
  }

  public async expectWriteReviewButtonToBeVisible(): Promise<void> {
    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.writeReviewButton).toBeVisible();
  }

  public async expectEditReviewButtonToBeVisible(): Promise<void> {
    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.editReviewButton).toBeVisible();
  }

  public async expectSaveButtonToShow(text: "Save" | "Saved"): Promise<void> {
    await expect(this.restaurantSaveButton).toContainText(text);
  }

  // Amenities Methods
  public getAmenityItem(amenityKey: string): Locator {
    return this.page.getByTestId(`amenity-item-${amenityKey}`);
  }

  public async clickShowMoreAmenities(): Promise<void> {
    await this.amenitiesShowMoreButton.click();
  }

  public async expectAmenityToBeVisible(amenityKey: string): Promise<void> {
    await expect(this.getAmenityItem(amenityKey)).toBeVisible();
  }

  public async expectShowMoreButtonText(text: string): Promise<void> {
    await expect(this.amenitiesShowMoreButton).toContainText(text);
  }

  public async getAmenitiesCount(): Promise<number> {
    return await this.page.locator('[data-testid^="amenity-item-"]').count();
  }

  // Reviews Methods
  public async expectReviewsToBeVisible(): Promise<void> {
    await expect(this.recommendedReviewsSection).toBeVisible();
  }

  public async expectReviewsCountToContain(text: string): Promise<void> {
    await expect(this.reviewsCount).toContainText(text);
  }

  public async expectOverallRatingToBeVisible(): Promise<void> {
    await expect(this.overallRatingSection).toBeVisible();
  }

  public async expectRatingDistributionToBeVisible(): Promise<void> {
    await expect(this.ratingDistribution).toBeVisible();
  }

  public getRatingBar(stars: 1 | 2 | 3 | 4 | 5): Locator {
    return this.page.getByTestId(`rating-bar-${stars}-stars`);
  }

  public async expectRatingBarToBeVisible(stars: 1 | 2 | 3 | 4 | 5): Promise<void> {
    await expect(this.getRatingBar(stars)).toBeVisible();
  }

  public async closeReviewsAlert(): Promise<void> {
    await this.reviewsAlertClose.click();
    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('domcontentloaded');
  }

  public async expectReviewsAlertToBeClosed(): Promise<void> {
    await expect(this.reviewsAlert).not.toBeVisible();
  }

  // Reviews Pagination Methods
  public async clickReviewsNextPage(): Promise<void> {
    await this.reviewsPaginationNext.click();
    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState('domcontentloaded');
  }

  public async clickReviewsPreviousPage(): Promise<void> {
    await this.reviewsPaginationPrevious.click();
    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState('domcontentloaded');
  }

  public getReviewsPaginationPageButton(pageNumber: number): Locator {
    return this.page.getByTestId(`pagination-page-${pageNumber}`);
  }

  public async clickReviewsPaginationPage(pageNumber: number): Promise<void> {
    await this.getReviewsPaginationPageButton(pageNumber).click();
    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('domcontentloaded');
  }

  public async expectReviewsPaginationPageToBeActive(pageNumber: number): Promise<void> {
    const buttonClass = await this.getReviewsPaginationPageButton(pageNumber).getAttribute("class");
    expect(buttonClass).toContain("font-extrabold");
  }

  public async expectReviewsPaginationInfoToContain(text: string): Promise<void> {
    await expect(this.paginationInfo).toContainText(text);
  }

  public async expectReviewsPreviousButtonToBeDisabled(): Promise<void> {
    await expect(this.reviewsPaginationPrevious).toBeDisabled();
  }

  public async expectReviewsPreviousButtonToBeEnabled(): Promise<void> {
    await expect(this.reviewsPaginationPrevious).toBeEnabled();
  }

  public async expectReviewsNextButtonToBeDisabled(): Promise<void> {
    await expect(this.reviewsPaginationNext).toBeDisabled();
  }

  public async expectReviewsNextButtonToBeEnabled(): Promise<void> {
    await expect(this.reviewsPaginationNext).toBeEnabled();
  }

  // Collection Methods
  public getCollectionItem(collectionName: string): Locator {
    return this.page
      .locator('[data-testid="collection-item-name"]', {
        hasText: collectionName
      })
      .locator("..");
  }

  public async clickCollectionItem(collectionName: string): Promise<void> {
    const collectionItem = this.getCollectionItem(collectionName);
    await collectionItem.click();
    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('domcontentloaded');
  }

  public async expectCollectionToBeSelected(collectionName: string): Promise<void> {
    const collectionItem = this.getCollectionItem(collectionName);
    await expect(collectionItem.getByTestId("collection-item-saved")).toBeVisible();
  }

  public async createNewCollection(collectionName: string): Promise<void> {
    await this.collectionNameInput.fill(collectionName);
    await this.saveCollectionButton.click();
    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('domcontentloaded');
  }

  public async expectCollectionNameInputValue(expectedValue: string): Promise<void> {
    await expect(this.collectionNameInput).toHaveValue(expectedValue);
  }

  public async closeNewCollectionDialog(): Promise<void> {
    await this.closeNewCollectionDialogButton.click();
  }

  // Write Review Methods
  public getRatingStar(rating: 1 | 2 | 3 | 4 | 5): Locator {
    return this.page.getByTestId(`rating-star-${rating}`);
  }

  public async selectRating(rating: 1 | 2 | 3 | 4 | 5): Promise<void> {
    await this.getRatingStar(rating).click();
  }

  public async fillReviewText(text: string): Promise<void> {
    await this.reviewTextarea.fill(text);
  }

  public async clearReviewText(): Promise<void> {
    await this.reviewTextarea.clear();
  }

  public async submitReview(): Promise<void> {
    await this.postReviewButton.click();
    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState('domcontentloaded');
  }

  public async submitEditedReview(): Promise<void> {
    await this.updateReviewButton.click();
    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState('domcontentloaded');
  }

  public async writeReview(rating: 1 | 2 | 3 | 4 | 5, reviewText: string): Promise<void> {
    await this.selectRating(rating);
    await this.fillReviewText(reviewText);
    await this.submitReview();
  }

  public async expectToBeOnReviewPage(restaurantId: string): Promise<void> {
    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('domcontentloaded');
    expect(this.page.url()).toContain(`/addreview/${restaurantId}`);
  }

  public async expectToBeOnEditReviewPage(reviewId: string): Promise<void> {
    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('domcontentloaded');
    expect(this.page.url()).toContain(`/editreview/${reviewId}`);
  }

  public async expectToBeBackOnRestaurantPage(restaurantId: string): Promise<void> {
    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('domcontentloaded');
    expect(this.page.url()).toContain(`/restaurants/${restaurantId}`);
  }

  public async expectReviewTextareaValue(expectedValue: string): Promise<void> {
    await expect(this.reviewTextarea).toHaveValue(expectedValue);
  }

  public async expectRatingLabelText(expectedText: string): Promise<void> {
    await expect(this.ratingLabel).toContainText(expectedText);
  }

  public async expectUpdateReviewButtonToBeVisible(): Promise<void> {
    await expect(this.updateReviewButton).toBeVisible();
  }

  public async expectUpdateReviewButtonToBeDisabled(): Promise<void> {
    await expect(this.updateReviewButton).toBeDisabled();
  }

  public async expectReviewTextError(): Promise<void> {
    await expect(this.page.getByText(/Please write a review|Reviews need to be at least 85 characters/i)).toBeVisible();
  }

  // General Methods
  public async expectLeftPanelToBeVisible(): Promise<void> {
    await expect(this.leftPanel).toBeVisible();
  }

  public async expectRightPanelToBeVisible(): Promise<void> {
    await expect(this.rightPanel).toBeVisible();
  }

  public async scrollToReviews(): Promise<void> {
    await this.recommendedReviewsSection.scrollIntoViewIfNeeded();
  }

  public async waitForPageLoad(): Promise<void> {
    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('domcontentloaded');
    await this.leftPanel.waitFor({ state: "visible" });
  }
}
