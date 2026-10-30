import { test } from "@playwright/test";
import { HomePage } from "./pages/home_page";

test.describe("Homepage filtering functionality", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test("should filter by suggested filter", async () => {
    await homePage.toggleSuggestedFilter("reservations");

    await homePage.expectSuggestedFilterToBeChecked("reservations");

    await homePage.expectAppliedFiltersToBeVisible();
    await homePage.expectFiltersCount(1);
    await homePage.expectAppliedFiltersListToContain("Reservations");
  });

  test("should filter by price", async () => {
    await homePage.selectPriceFilter(2);

    await homePage.expectPriceFilterToBeSelected(2);

    await homePage.expectAppliedFiltersToBeVisible();
    await homePage.expectFiltersCount(1);
    await homePage.expectAppliedFiltersListToContain("$$");
  });

  test("should filter by category", async () => {
    await homePage.selectCategoryFilter("italian");

    await homePage.expectCategoryFilterToBeSelected("italian");

    await homePage.expectAppliedFiltersToBeVisible();
    await homePage.expectFiltersCount(1);
    await homePage.expectAppliedFiltersListToContain("Italian");
  });

  test("should filter by features", async () => {
    await homePage.toggleFeatureFilter("takeout");

    await homePage.expectFeatureFilterToBeChecked("takeout");

    await homePage.expectAppliedFiltersToBeVisible();
    await homePage.expectFiltersCount(1);
    await homePage.expectAppliedFiltersListToContain("Takeout");
  });

  test("should filter by distance", async () => {
    await homePage.selectDistanceFilter("walking-1mi");

    await homePage.expectDistanceFilterToBeChecked("walking-1mi");

    await homePage.expectAppliedFiltersToBeVisible();
    await homePage.expectFiltersCount(1);
    await homePage.expectAppliedFiltersListToContain("Walking (1 mi.)");
  });

  test("should filter using all filter types together", async () => {
    await homePage.selectPriceFilter(3);
    await homePage.toggleSuggestedFilter("delivery");
    await homePage.toggleSuggestedFilter("takeout");
    await homePage.selectCategoryFilter("italian");
    await homePage.toggleFeatureFilter("acceptsCreditCards");
    await homePage.selectDistanceFilter("driving-5mi");

    await homePage.expectPriceFilterToBeSelected(3);
    await homePage.expectSuggestedFilterToBeChecked("delivery");
    await homePage.expectSuggestedFilterToBeChecked("takeout");
    await homePage.expectCategoryFilterToBeSelected("italian");
    await homePage.expectFeatureFilterToBeChecked("acceptsCreditCards");
    await homePage.expectDistanceFilterToBeChecked("driving-5mi");

    await homePage.expectAppliedFiltersToBeVisible();
    await homePage.expectFiltersCount(6);
    await homePage.expectAppliedFiltersListToContain("$$$");
    await homePage.expectAppliedFiltersListToContain("Delivery");
    await homePage.expectAppliedFiltersListToContain("Takeout");
    await homePage.expectAppliedFiltersListToContain("Italian");
    await homePage.expectAppliedFiltersListToContain("Accepts Credit Cards");
    await homePage.expectAppliedFiltersListToContain("Driving (5 mi.)");
  });

  test("should clear all filters using clear button", async () => {
    await homePage.selectPriceFilter(2);
    await homePage.toggleSuggestedFilter("reservations");
    await homePage.selectCategoryFilter("italian");

    await homePage.expectAppliedFiltersToBeVisible();
    await homePage.expectFiltersCount(3);

    await homePage.clearAllFilters();

    await homePage.expectAppliedFiltersToBeHidden();
  });

  test("should open category see all dialog and verify options", async () => {
    await homePage.openCategorySeeAll();

    await homePage.expectCategoryDialogToBeVisible();

    await homePage.selectCategoryInDialog("japanese");
    await homePage.expectCategoryInDialogToBeChecked("japanese");

    await homePage.selectCategoryInDialog("mexican");
    await homePage.expectCategoryInDialogToBeChecked("mexican");
  });

  test("should close category see all dialog when clicking X", async () => {
    await homePage.openCategorySeeAll();

    await homePage.expectCategoryDialogToBeVisible();

    await homePage.selectCategoryInDialog("chinese");
    await homePage.expectCategoryInDialogToBeChecked("chinese");

    await homePage.closeDialogWithX();

    await homePage.expectDialogToBeClosed();

    await homePage.expectAppliedFiltersToBeHidden();
  });

  test("should apply category filters from see all dialog using search button", async () => {
    await homePage.openCategorySeeAll();

    await homePage.selectCategoryInDialog("thai");
    await homePage.selectCategoryInDialog("american");

    await homePage.clickSearchButton();

    await homePage.expectDialogToBeClosed();

    await homePage.expectAppliedFiltersToBeVisible();
    await homePage.expectFiltersCount(2);
    await homePage.expectAppliedFiltersListToContain("thai");
    await homePage.expectAppliedFiltersListToContain("American");
  });

  test("should open feature see all dialog and verify options", async () => {
    await homePage.openFeatureSeeAll();

    await homePage.expectFeatureDialogToBeVisible();

    await homePage.selectFeatureInDialog("goodForGroups");
    await homePage.expectFeatureInDialogToBeChecked("goodForGroups");

    await homePage.selectFeatureInDialog("parking");
    await homePage.expectFeatureInDialogToBeChecked("parking");
  });

  test("should close feature see all dialog when clicking X", async () => {
    await homePage.openFeatureSeeAll();

    await homePage.expectFeatureDialogToBeVisible();

    await homePage.selectFeatureInDialog("fullBar");
    await homePage.expectFeatureInDialogToBeChecked("fullBar");

    await homePage.closeDialogWithX();

    await homePage.expectDialogToBeClosed();

    await homePage.expectAppliedFiltersToBeHidden();
  });

  test("should apply feature filters from see all dialog using search button", async () => {
    await homePage.openFeatureSeeAll();

    await homePage.selectFeatureInDialog("petFriendly");
    await homePage.selectFeatureInDialog("wheelchairAccessible");
    await homePage.selectFeatureInDialog("liveMusic");

    await homePage.clickSearchButton();

    await homePage.expectDialogToBeClosed();

    await homePage.expectAppliedFiltersToBeVisible();
    await homePage.expectFiltersCount(3);
    await homePage.expectAppliedFiltersListToContain("Pet Friendly");
    await homePage.expectAppliedFiltersListToContain("Wheelchair Accessible");
    await homePage.expectAppliedFiltersListToContain("Live Music");
  });

  test("should clear filters when they are already applied", async () => {
    await homePage.selectPriceFilter(4);
    await homePage.toggleSuggestedFilter("open-now");
    await homePage.toggleSuggestedFilter("dinner");
    await homePage.selectCategoryFilter("mexican");
    await homePage.toggleFeatureFilter("goodForLunch");
    await homePage.selectDistanceFilter("biking-2mi");

    await homePage.expectAppliedFiltersToBeVisible();
    await homePage.expectFiltersCount(6);

    await homePage.clearAllFilters();

    await homePage.expectAppliedFiltersToBeHidden();
  });
});
