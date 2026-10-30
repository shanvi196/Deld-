import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class UserReviewsPage {
  public readonly page: Page;

  // Page Header
  public readonly reviewsHeading: Locator;

  // Review Cards
  public readonly myReviewCards: Locator;

  // Pagination
  public readonly paginationPrevious: Locator;
  public readonly paginationNext: Locator;

  public constructor(page: Page) {
    this.page = page;

    // Page Header
    this.reviewsHeading = page.locator("#reviews-heading");

    // Review Cards
    this.myReviewCards = page.getByTestId("my-review-card");

    // Pagination
    this.paginationPrevious = page.getByTestId("pagination-previous");
    this.paginationNext = page.getByTestId("pagination-next");
  }

  public async goto(): Promise<void> {
    await this.page.goto("http://localhost:3000/user/reviews");
    await this.page.waitForTimeout(1500);
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Review Methods
  public async getReviewCardByRestaurantId(restaurantId: string): Promise<Locator | null> {
    const cards = await this.myReviewCards.all();

    for (const card of cards) {
      const restaurantLink = card.locator('[data-testid="restaurant-card-link"]');
      const href = await restaurantLink.getAttribute("href");

      if (href?.includes(restaurantId)) {
        return card;
      }
    }

    return null;
  }

  public async expectReviewToBeVisible(reviewText: string): Promise<void> {
    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page.getByText(reviewText)).toBeVisible();
  }

  public async expectReviewWithRatingToBeVisible(rating: number, reviewText: string): Promise<void> {
    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('domcontentloaded');
    await this.expectReviewToBeVisible(reviewText);
  }

  public async expectReviewsHeadingToBeVisible(): Promise<void> {
    await expect(this.reviewsHeading).toBeVisible();
  }

  public async expectReviewCardCount(count: number): Promise<void> {
    await expect(this.myReviewCards).toHaveCount(count);
  }

  public async expectAtLeastOneReviewCard(): Promise<void> {
    await expect(this.myReviewCards.first()).toBeVisible();
  }

  // Pagination Methods
  public getPaginationPageButton(pageNumber: number): Locator {
    return this.page.getByTestId(`pagination-page-${pageNumber}`);
  }

  public async clickPaginationPage(pageNumber: number): Promise<void> {
    await this.getPaginationPageButton(pageNumber).click();
    await this.page.waitForTimeout(1500);
    await this.page.waitForLoadState('domcontentloaded');
  }

  public async clickNextPage(): Promise<void> {
    await this.paginationNext.click();
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('domcontentloaded');
  }

  public async clickPreviousPage(): Promise<void> {
    await this.paginationPrevious.click();
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('domcontentloaded');
  }

  public async expectPaginationPageToBeActive(pageNumber: number): Promise<void> {
    const buttonClass = await this.getPaginationPageButton(pageNumber).getAttribute("class");
    expect(buttonClass).toContain("font-extrabold");
  }

  // URL Assertions
  public async expectToBeOnReviewsPage(): Promise<void> {
    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('domcontentloaded');
    expect(this.page.url()).toContain("/user/reviews");
  }

  // Helper Methods
  public async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(1000);
  }
}
