import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { LoginComponent } from "../components/login_component";
import { TopBar } from "../components/top_bar";

export class HomePage {
  public readonly page: Page;
  public readonly headerLoginButton: Locator;
  public readonly loginComponent: LoginComponent;
  public readonly topBar: TopBar;

  // Applied Filters
  public readonly appliedFilters: Locator;
  public readonly filtersCount: Locator;
  public readonly appliedFiltersList: Locator;
  public readonly clearAllFiltersButton: Locator;

  // Price Filter
  public readonly priceFilter1: Locator;
  public readonly priceFilter2: Locator;
  public readonly priceFilter3: Locator;
  public readonly priceFilter4: Locator;

  // Suggested Filter
  public readonly suggestedFilterOpenNow: Locator;
  public readonly suggestedFilterReservations: Locator;
  public readonly suggestedFilterOnlineWaitlist: Locator;
  public readonly suggestedFilterDelivery: Locator;
  public readonly suggestedFilterTakeout: Locator;
  public readonly suggestedFilterDinner: Locator;

  // Distance Filter
  public readonly distanceFilter: Locator;
  public readonly distanceFilterBirdsEyeView: Locator;
  public readonly distanceFilterDriving5mi: Locator;
  public readonly distanceFilterBiking2mi: Locator;
  public readonly distanceFilterWalking1mi: Locator;
  public readonly distanceFilterWithin4Blocks: Locator;

  // All Options Dialog
  public readonly categoryAllOptionsDialog: Locator;
  public readonly featureAllOptionsDialog: Locator;
  public readonly allOptionsSearchButton: Locator;
  public readonly dialogCloseButton: Locator;

  // Search
  public readonly searchQueryInput: Locator;
  public readonly searchLocationInput: Locator;
  public readonly searchSubmitButton: Locator;

  // Pagination
  public readonly paginationPrevious: Locator;
  public readonly paginationNext: Locator;
  public readonly paginationNextPageButton: Locator;

  // Restaurant Cards
  public readonly restaurantCards: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.headerLoginButton = page.getByTestId("header-login-button");
    this.loginComponent = new LoginComponent(page);
    this.topBar = new TopBar(page);

    // Applied Filters
    this.appliedFilters = page.getByTestId("applied-filters");
    this.filtersCount = page.getByTestId("filters-count");
    this.appliedFiltersList = page.getByTestId("applied-filters-list");
    this.clearAllFiltersButton = page.getByTestId("clear-all-filters");

    // Price Filter
    this.priceFilter1 = page.getByTestId("price-filter-1");
    this.priceFilter2 = page.getByTestId("price-filter-2");
    this.priceFilter3 = page.getByTestId("price-filter-3");
    this.priceFilter4 = page.getByTestId("price-filter-4");

    // Suggested Filter
    this.suggestedFilterOpenNow = page.getByTestId("suggested-filter-open-now");
    this.suggestedFilterReservations = page.getByTestId("suggested-filter-reservations");
    this.suggestedFilterOnlineWaitlist = page.getByTestId("suggested-filter-online-waitlist");
    this.suggestedFilterDelivery = page.getByTestId("suggested-filter-delivery");
    this.suggestedFilterTakeout = page.getByTestId("suggested-filter-takeout");
    this.suggestedFilterDinner = page.getByTestId("suggested-filter-dinner");

    // Distance Filter
    this.distanceFilter = page.getByTestId("distance-filter");
    this.distanceFilterBirdsEyeView = page.getByTestId("distance-filter-birds-eye-view");
    this.distanceFilterDriving5mi = page.getByTestId("distance-filter-driving-5mi");
    this.distanceFilterBiking2mi = page.getByTestId("distance-filter-biking-2mi");
    this.distanceFilterWalking1mi = page.getByTestId("distance-filter-walking-1mi");
    this.distanceFilterWithin4Blocks = page.getByTestId("distance-filter-within-4-blocks");

    // All Options Dialog
    this.categoryAllOptionsDialog = page.getByTestId("category-all-options-dialog");
    this.featureAllOptionsDialog = page.getByTestId("feature-all-options-dialog");
    this.allOptionsSearchButton = page.getByTestId("all-options-search-button");
    this.dialogCloseButton = page.getByTestId("dialog-close-button");

    // Search
    this.searchQueryInput = page.getByTestId("search-query-input");
    this.searchLocationInput = page.getByTestId("search-location-input");
    this.searchSubmitButton = page.getByTestId("search-submit-button");

    // Pagination
    this.paginationPrevious = page.getByTestId("pagination-previous");
    this.paginationNext = page.getByTestId("pagination-next");
    this.paginationNextPageButton = page.getByTestId("pagination-next-page-button");

    // Restaurant Cards
    this.restaurantCards = page.locator('[data-testid^="restaurant-card-link-"]');
  }

  public async goto(): Promise<void> {
    await this.page.goto("http://localhost:3000");
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForTimeout(1500);
  }

  public async openLoginDialog(): Promise<void> {
    await this.headerLoginButton.click();
    await this.page.waitForTimeout(1000);
  }

  public async expectLoginButtonToBeVisible(): Promise<void> {
    await expect(this.headerLoginButton).toBeVisible();
  }

  public async expectLoginButtonToBeHidden(): Promise<void> {
    await expect(this.headerLoginButton).not.toBeVisible();
  }

  // Price Filter Methods
  public async selectPriceFilter(level: 1 | 2 | 3 | 4): Promise<void> {
    const filterMap = {
      1: this.priceFilter1,
      2: this.priceFilter2,
      3: this.priceFilter3,
      4: this.priceFilter4
    };
    await filterMap[level].click();
  }

  public async expectPriceFilterToBeSelected(level: 1 | 2 | 3 | 4): Promise<void> {
    const filterMap = {
      1: this.priceFilter1,
      2: this.priceFilter2,
      3: this.priceFilter3,
      4: this.priceFilter4
    };
    await expect(filterMap[level]).toHaveAttribute("aria-pressed", "true");
  }

  // Suggested Filter Methods
  public async toggleSuggestedFilter(
    filter: "open-now" | "reservations" | "online-waitlist" | "delivery" | "takeout" | "dinner"
  ): Promise<void> {
    const filterMap = {
      "open-now": this.suggestedFilterOpenNow,
      reservations: this.suggestedFilterReservations,
      "online-waitlist": this.suggestedFilterOnlineWaitlist,
      delivery: this.suggestedFilterDelivery,
      takeout: this.suggestedFilterTakeout,
      dinner: this.suggestedFilterDinner
    };
    await filterMap[filter].click();
  }

  public async expectSuggestedFilterToBeChecked(
    filter: "open-now" | "reservations" | "online-waitlist" | "delivery" | "takeout" | "dinner"
  ): Promise<void> {
    const filterMap = {
      "open-now": this.suggestedFilterOpenNow,
      reservations: this.suggestedFilterReservations,
      "online-waitlist": this.suggestedFilterOnlineWaitlist,
      delivery: this.suggestedFilterDelivery,
      takeout: this.suggestedFilterTakeout,
      dinner: this.suggestedFilterDinner
    };
    await expect(filterMap[filter]).toBeChecked();
  }

  // Category Filter Methods
  public getCategoryFilter(categoryId: string): Locator {
    return this.page.getByTestId(`category-filter-${categoryId}`);
  }

  public async selectCategoryFilter(categoryId: string): Promise<void> {
    await this.getCategoryFilter(categoryId).click();
  }

  public async expectCategoryFilterToBeSelected(categoryId: string): Promise<void> {
    await expect(this.getCategoryFilter(categoryId)).toHaveAttribute("aria-pressed", "true");
  }

  public async openCategorySeeAll(): Promise<void> {
    await this.page.getByRole("button", { name: "See all" }).first().click();
  }

  public async expectCategoryDialogToBeVisible(): Promise<void> {
    await expect(this.categoryAllOptionsDialog).toBeVisible();
  }

  public async selectCategoryInDialog(categoryId: string): Promise<void> {
    await this.page.getByTestId(`all-options-${categoryId}`).click();
  }

  public async expectCategoryInDialogToBeChecked(categoryId: string): Promise<void> {
    await expect(this.page.getByTestId(`all-options-${categoryId}`)).toBeChecked();
  }

  // Feature Filter Methods
  public getFeatureFilter(featureId: string): Locator {
    return this.page.getByTestId(`feature-filter-${featureId}`);
  }

  public async toggleFeatureFilter(featureId: string): Promise<void> {
    await this.getFeatureFilter(featureId).click();
  }

  public async expectFeatureFilterToBeChecked(featureId: string): Promise<void> {
    await expect(this.getFeatureFilter(featureId)).toBeChecked();
  }

  public async openFeatureSeeAll(): Promise<void> {
    await this.page.getByRole("button", { name: "See all" }).nth(1).click();
  }

  public async expectFeatureDialogToBeVisible(): Promise<void> {
    await expect(this.featureAllOptionsDialog).toBeVisible();
  }

  public async selectFeatureInDialog(featureId: string): Promise<void> {
    await this.page.getByTestId(`all-options-${featureId}`).click();
  }

  public async expectFeatureInDialogToBeChecked(featureId: string): Promise<void> {
    await expect(this.page.getByTestId(`all-options-${featureId}`)).toBeChecked();
  }

  // Distance Filter Methods
  public async selectDistanceFilter(
    distance: "birds-eye-view" | "driving-5mi" | "biking-2mi" | "walking-1mi" | "within-4-blocks"
  ): Promise<void> {
    const filterMap = {
      "birds-eye-view": this.distanceFilterBirdsEyeView,
      "driving-5mi": this.distanceFilterDriving5mi,
      "biking-2mi": this.distanceFilterBiking2mi,
      "walking-1mi": this.distanceFilterWalking1mi,
      "within-4-blocks": this.distanceFilterWithin4Blocks
    };
    await filterMap[distance].click();
  }

  public async expectDistanceFilterToBeChecked(
    distance: "birds-eye-view" | "driving-5mi" | "biking-2mi" | "walking-1mi" | "within-4-blocks"
  ): Promise<void> {
    const filterMap = {
      "birds-eye-view": this.distanceFilterBirdsEyeView,
      "driving-5mi": this.distanceFilterDriving5mi,
      "biking-2mi": this.distanceFilterBiking2mi,
      "walking-1mi": this.distanceFilterWalking1mi,
      "within-4-blocks": this.distanceFilterWithin4Blocks
    };
    await expect(filterMap[distance]).toBeChecked();
  }

  // Dialog Methods
  public async clickSearchButton(): Promise<void> {
    await this.allOptionsSearchButton.click();
    await this.page.waitForTimeout(1000);
  }

  public async closeDialogWithX(): Promise<void> {
    await this.dialogCloseButton.click();
    await this.page.waitForTimeout(1000);
  }

  public async expectDialogToBeClosed(): Promise<void> {
    await this.page.waitForTimeout(1000);
    await expect(this.categoryAllOptionsDialog).not.toBeVisible();
    await expect(this.featureAllOptionsDialog).not.toBeVisible();
  }

  // Applied Filters Methods
  public async expectAppliedFiltersToBeVisible(): Promise<void> {
    await expect(this.appliedFilters).toBeVisible();
  }

  public async expectFiltersCount(count: number): Promise<void> {
    await expect(this.filtersCount).toHaveText(`${count} filter${count !== 1 ? "s" : ""}`);
  }

  public async clearAllFilters(): Promise<void> {
    await this.clearAllFiltersButton.click();
  }

  public async expectAppliedFiltersToBeHidden(): Promise<void> {
    await expect(this.appliedFilters).not.toBeVisible();
  }

  public async expectAppliedFiltersListToContain(text: string): Promise<void> {
    await expect(this.appliedFiltersList).toContainText(text);
  }

  // Search Methods
  public async fillSearchQuery(query: string): Promise<void> {
    await this.searchQueryInput.fill(query);
    await this.page.waitForTimeout(1500);
  }

  public async fillSearchLocation(location: string): Promise<void> {
    await this.searchLocationInput.fill(location);
    await this.page.waitForTimeout(1000);
  }

  public async clickSearchSubmit(): Promise<void> {
    await this.searchSubmitButton.click();
    await this.page.waitForTimeout(1000);
  }

  public async search(query: string, location: string): Promise<void> {
    await this.fillSearchQuery(query);
    await this.fillSearchLocation(location);
  }

  public async expectSearchQueryValue(expectedValue: string): Promise<void> {
    await expect(this.searchQueryInput).toHaveValue(expectedValue);
  }

  public async expectSearchLocationValue(expectedValue: string): Promise<void> {
    await expect(this.searchLocationInput).toHaveValue(expectedValue);
  }

  public async expectUrlToContainSearchParams(query?: string, location?: string): Promise<void> {
    const url = new URL(this.page.url());
    const params = url.searchParams;

    if (query !== undefined) {
      expect(params.get("query")).toBe(query);
    }
    if (location !== undefined) {
      expect(params.get("location")).toBe(location);
    }
  }

  public async waitForSearchDebounce(): Promise<void> {
    await this.page.waitForTimeout(600);
  }

  // Pagination Methods
  public async clickNextPage(): Promise<void> {
    await this.paginationNext.click();
    await this.page.waitForTimeout(1500);
    await this.page.waitForLoadState('domcontentloaded');
  }

  public async clickPreviousPage(): Promise<void> {
    await this.paginationPrevious.click();
    await this.page.waitForTimeout(1500);
    await this.page.waitForLoadState('domcontentloaded');
  }

  public async clickNextPageButton(): Promise<void> {
    await this.paginationNextPageButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  public getPaginationPageButton(pageNumber: number): Locator {
    return this.page.getByTestId(`pagination-page-${pageNumber}`);
  }

  public async clickPaginationPage(pageNumber: number): Promise<void> {
    await this.getPaginationPageButton(pageNumber).click();
  }

  public async expectPaginationPageToBeActive(pageNumber: number): Promise<void> {
    await this.page.waitForTimeout(1000);
    const buttonClass = await this.getPaginationPageButton(pageNumber).getAttribute("class");
    expect(buttonClass).toContain("bg-primary");
  }

  public async expectPreviousButtonToBeDisabled(): Promise<void> {
    await expect(this.paginationPrevious).toBeDisabled();
  }

  public async expectPreviousButtonToBeEnabled(): Promise<void> {
    await expect(this.paginationPrevious).toBeEnabled();
  }

  public async expectNextButtonToBeDisabled(): Promise<void> {
    await expect(this.paginationNext).toBeDisabled();
  }

  public async expectNextButtonToBeEnabled(): Promise<void> {
    await expect(this.paginationNext).toBeEnabled();
  }

  public async expectUrlToContainPage(pageNumber: number): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`[?&]page=${pageNumber}`));
  }

  public async expectUrlToBeFirstPage(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page).toHaveURL("http://localhost:3000");
  }

  public async expectPageToBeScrolledToTop(): Promise<void> {
    const scrollY = await this.page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);
  }

  // Restaurant Card Methods
  public getRestaurantCardLink(restaurantId: string): Locator {
    return this.page.getByTestId(`restaurant-card-link-${restaurantId}`);
  }

  public getFirstRestaurantCard(): Locator {
    return this.restaurantCards.first();
  }

  public getRestaurantCardByIndex(index: number): Locator {
    return this.restaurantCards.nth(index);
  }

  public async clickRestaurantCard(restaurantId: string): Promise<void> {
    await this.getRestaurantCardLink(restaurantId).click();
  }

  public async clickFirstRestaurantCard(): Promise<void> {
    await this.getFirstRestaurantCard().click();
    await this.page.waitForTimeout(1500);
  }

  public async clickRestaurantCardByIndex(index: number): Promise<void> {
    await this.getRestaurantCardByIndex(index).click();
    await this.page.waitForTimeout(1500);
  }

  public async getRestaurantIdFromCard(index: number): Promise<string> {
    const testId = await this.getRestaurantCardByIndex(index).getAttribute("data-testid");
    if (!testId) {
      throw new Error(`Restaurant card at index ${index} has no data-testid`);
    }
    return testId.replace("restaurant-card-link-", "");
  }

  public async expectRestaurantCardsToBeVisible(): Promise<void> {
    await expect(this.restaurantCards.first()).toBeVisible();
  }

  public async expectRestaurantCardCount(count: number): Promise<void> {
    await expect(this.restaurantCards).toHaveCount(count);
  }

  public async expectToBeOnRestaurantPage(restaurantId: string): Promise<void> {
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('domcontentloaded');
    expect(this.page.url()).toContain(`/restaurants/${restaurantId}`);
  }

  public async expectToBeOnAnyRestaurantPage(): Promise<void> {
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('domcontentloaded');
    expect(this.page.url()).toContain("/restaurants");
  }
}
