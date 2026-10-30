import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class CollectionsPage {
  public readonly page: Page;

  // Collections Page Header
  public readonly collectionsHeading: Locator;
  public readonly createCollectionButton: Locator;

  // New Collection Dialog
  public readonly collectionNameInput: Locator;
  public readonly saveCollectionButton: Locator;
  public readonly closeNewCollectionDialogButton: Locator;

  // Collections Grid
  public readonly collectionsGrid: Locator;

  // Collection Detail Page
  public readonly collectionInfo: Locator;
  public readonly removeCollectionButton: Locator;
  public readonly confirmRemoveCollectionButton: Locator;
  public readonly cancelRemoveCollectionButton: Locator;

  // Map on Collection Detail Page
  public readonly collectionMap: Locator;

  public constructor(page: Page) {
    this.page = page;

    // Collections Page Header
    this.collectionsHeading = page.locator("#collections-heading");
    this.createCollectionButton = page.getByTestId("create-collection-button");

    // New Collection Dialog
    this.collectionNameInput = page.getByTestId("collection-name-input");
    this.saveCollectionButton = page.getByTestId("save-collection-button");
    this.closeNewCollectionDialogButton = page.getByTestId("close-new-collection-dialog-button");

    // Collections Grid
    this.collectionsGrid = page.getByTestId("collections-grid");

    // Collection Detail Page
    this.collectionInfo = page.getByTestId("collection-info");
    this.removeCollectionButton = page.getByTestId("remove-collection-button");
    this.confirmRemoveCollectionButton = page.getByTestId("confirm-remove-collection-button");
    this.cancelRemoveCollectionButton = page.getByTestId("cancel-remove-collection-button");

    // Map on Collection Detail Page (Leaflet adds this class automatically)
    this.collectionMap = page.locator(".leaflet-container");
  }

  public async goto(): Promise<void> {
    await this.page.goto("http://localhost:3000/user/collections");
    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Navigation Methods
  public async gotoCollectionDetail(collectionId: string): Promise<void> {
    await this.page.goto(`http://localhost:3000/user/collections/${collectionId}`);
    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Create Collection Methods
  public async clickCreateCollection(): Promise<void> {
    await this.createCollectionButton.click();
    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('domcontentloaded');
  }

  public async fillCollectionName(name: string): Promise<void> {
    await this.collectionNameInput.fill(name);
  }

  public async clickSaveCollection(): Promise<void> {
    await this.saveCollectionButton.click();
    await this.page.waitForTimeout(1000);
  }

  public async clickCloseDialog(): Promise<void> {
    await this.closeNewCollectionDialogButton.click();
    await this.page.waitForTimeout(1000);
  }

  public async createNewCollection(name: string): Promise<void> {
    await this.clickCreateCollection();
    await this.fillCollectionName(name);
    await this.clickSaveCollection();
  }

  // Collection Tile Methods
  public getCollectionTile(collectionName: string): Locator {
    return this.page.getByTestId("collection-tile-name").filter({ hasText: collectionName });
  }

  public async clickCollectionTile(collectionName: string): Promise<void> {
    await this.getCollectionTile(collectionName).click();
    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState("networkidle");
  }

  // Remove Collection Methods
  public async clickRemoveCollection(): Promise<void> {
    await this.removeCollectionButton.click();
    await this.page.waitForTimeout(1500);
  }

  public async clickConfirmRemove(): Promise<void> {
    await this.confirmRemoveCollectionButton.click();
    await this.page.waitForTimeout(1000);
  }

  public async clickCancelRemove(): Promise<void> {
    await this.cancelRemoveCollectionButton.click();
    await this.page.waitForTimeout(1500);
  }

  // Assertion Methods
  public async expectCreateCollectionButtonToBeVisible(): Promise<void> {
    await expect(this.createCollectionButton).toBeVisible();
  }

  public async expectCollectionNameInputToBeVisible(): Promise<void> {
    await expect(this.collectionNameInput).toBeVisible();
  }

  public async expectCollectionNameInputValue(expectedValue: string): Promise<void> {
    await expect(this.collectionNameInput).toHaveValue(expectedValue);
  }

  public async expectSaveCollectionButtonToBeDisabled(): Promise<void> {
    await expect(this.saveCollectionButton).toBeDisabled();
  }

  public async expectSaveCollectionButtonToBeEnabled(): Promise<void> {
    await expect(this.saveCollectionButton).toBeEnabled();
  }

  public async expectCollectionToBeVisible(collectionName: string): Promise<void> {
    await expect(this.getCollectionTile(collectionName)).toBeVisible();
  }

  public async expectCollectionNotToBeVisible(collectionName: string): Promise<void> {
    await expect(this.getCollectionTile(collectionName)).not.toBeVisible();
  }

  public async expectCollectionNameError(): Promise<void> {
    await expect(
      this.page.getByText(/A collection with the name|already exists|Collection name is required/i)
    ).toBeVisible();
  }

  public async expectToBeOnCollectionsPage(): Promise<void> {
    await this.page.waitForTimeout(1000);
    expect(this.page.url()).toContain("/user/collections");
    expect(this.page.url()).not.toContain("/user/collections/");
  }

  public async expectToBeOnCollectionDetailPage(collectionId?: string): Promise<void> {
    await this.page.waitForTimeout(1000);
    if (collectionId) {
      expect(this.page.url()).toContain(`/user/collections/${collectionId}`);
    } else {
      expect(this.page.url()).toMatch(/\/user\/collections\/[a-f0-9-]+/);
    }
  }

  public async expectCollectionInfoToBeVisible(): Promise<void> {
    await expect(this.collectionInfo).toBeVisible();
  }

  public async expectMapToBeVisible(): Promise<void> {
    await expect(this.collectionMap).toBeVisible();
  }

  public async expectRemoveCollectionButtonToBeVisible(): Promise<void> {
    await expect(this.removeCollectionButton).toBeVisible();
  }

  public async expectRemoveCollectionDialogToBeVisible(): Promise<void> {
    await expect(this.page.getByText("Are you sure you want to remove this collection?")).toBeVisible();
  }

  public async expectRemoveCollectionDialogNotToBeVisible(): Promise<void> {
    await expect(this.page.getByText("Are you sure you want to remove this collection?")).not.toBeVisible();
  }

  // Helper Methods
  public async waitForCollectionsGridToLoad(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(1000);
  }
}
