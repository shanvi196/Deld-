import { test } from "@playwright/test";
import { TEST_USER } from "./fixtures/test_users";
import { CollectionsPage } from "./pages/collections_page";
import { HomePage } from "./pages/home_page";

test.describe("Collections Page", () => {
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

    await collectionsPage.goto();
    await collectionsPage.waitForCollectionsGridToLoad();
  });

  test.afterEach(async ({ page }) => {
    console.log("=== CLEANUP: Starting afterEach hook ===");
    await collectionsPage.page.waitForTimeout(1000);

    try {
      const baseUrl = new URL(page.url()).origin;
      console.log(`CLEANUP: Base URL: ${baseUrl}`);

      for (const collectionName of createdCollectionNames) {
        console.log(`CLEANUP: Attempting to delete collection: ${collectionName}`);

        try {
          const collectionsResponse = await page.request.get(`${baseUrl}/api/collections`);

          if (collectionsResponse.ok()) {
            const collectionsData = await collectionsResponse.json();
            console.log("CLEANUP: Collections data:", JSON.stringify(collectionsData, null, 2));

            const collection = collectionsData.data?.collections?.find(
              (c: { name: string }) => c.name === collectionName
            );

            if (collection?.id) {
              console.log(`CLEANUP: Found collection ID: ${collection.id}`);
              const deleteResponse = await page.request.delete(
                `${baseUrl}/api/collections?collectionId=${collection.id}`
              );
              console.log(`CLEANUP: Delete status: ${deleteResponse.status()}`);

              if (deleteResponse.ok()) {
                console.log(`CLEANUP: Collection "${collectionName}" successfully deleted`);
              } else {
                const deleteText = await deleteResponse.text();
                console.log(`CLEANUP: Delete failed with status ${deleteResponse.status()}`);
                console.log(`CLEANUP: Delete response body:`, deleteText);
              }
            } else {
              console.log(`CLEANUP: Collection "${collectionName}" not found`);
            }
          } else {
            console.log(`CLEANUP: Failed to fetch collections, status: ${collectionsResponse.status()}`);
          }
        } catch (error) {
          console.error(`CLEANUP: Error deleting collection "${collectionName}":`, error);
        }
      }

      createdCollectionNames.length = 0;
    } catch (error) {
      console.error("CLEANUP: Error occurred:", error);
    }

    console.log("=== CLEANUP: Finished afterEach hook ===");
  });

  test.describe("Create New Collection", () => {
    test("should create a new collection successfully", async () => {
      await collectionsPage.expectCreateCollectionButtonToBeVisible();

      const collectionName = `Test Collection ${Date.now()}`;
      createdCollectionNames.push(collectionName);

      await collectionsPage.createNewCollection(collectionName);

      await collectionsPage.waitForCollectionsGridToLoad();

      await collectionsPage.expectCollectionToBeVisible(collectionName);
    });

    test("should block creating collection with duplicate name", async () => {
      const collectionName = `Duplicate Collection ${Date.now()}`;
      createdCollectionNames.push(collectionName);

      await collectionsPage.createNewCollection(collectionName);

      await collectionsPage.waitForCollectionsGridToLoad();

      await collectionsPage.expectCollectionToBeVisible(collectionName);

      await collectionsPage.clickCreateCollection();

      await collectionsPage.fillCollectionName(collectionName);

      await collectionsPage.clickSaveCollection();

      await collectionsPage.expectCollectionNameError();

      await collectionsPage.clickCloseDialog();
    });

    test("should not allow creating collection with no name", async () => {
      await collectionsPage.clickCreateCollection();

      await collectionsPage.expectCollectionNameInputToBeVisible();

      await collectionsPage.expectSaveCollectionButtonToBeDisabled();

      await collectionsPage.fillCollectionName("");

      await collectionsPage.expectSaveCollectionButtonToBeDisabled();

      await collectionsPage.clickCloseDialog();
    });
  });

  test.describe("View Collection Details", () => {
    test("should display collection page with map when clicking on collection", async () => {
      const collectionName = `Map Test Collection ${Date.now()}`;
      createdCollectionNames.push(collectionName);

      await collectionsPage.createNewCollection(collectionName);

      await collectionsPage.waitForCollectionsGridToLoad();

      await collectionsPage.clickCollectionTile(collectionName);

      await collectionsPage.expectToBeOnCollectionDetailPage();

      await collectionsPage.expectCollectionInfoToBeVisible();

      await collectionsPage.expectMapToBeVisible();
    });
  });

  test.describe("Remove Collection", () => {
    test("should remove collection when confirming deletion", async () => {
      const collectionName = `Remove Test Collection ${Date.now()}`;
      createdCollectionNames.push(collectionName);

      await collectionsPage.createNewCollection(collectionName);

      await collectionsPage.waitForCollectionsGridToLoad();

      await collectionsPage.expectCollectionToBeVisible(collectionName);

      await collectionsPage.clickCollectionTile(collectionName);

      await collectionsPage.expectToBeOnCollectionDetailPage();

      await collectionsPage.expectRemoveCollectionButtonToBeVisible();

      await collectionsPage.clickRemoveCollection();

      await collectionsPage.expectRemoveCollectionDialogToBeVisible();

      await collectionsPage.clickConfirmRemove();

      await collectionsPage.expectToBeOnCollectionsPage();

      const index = createdCollectionNames.indexOf(collectionName);
      if (index > -1) {
        createdCollectionNames.splice(index, 1);
      }

      await collectionsPage.waitForCollectionsGridToLoad();

      await collectionsPage.expectCollectionNotToBeVisible(collectionName);
    });

    test("should not remove collection when cancelling deletion", async () => {
      const collectionName = `Cancel Remove Test Collection ${Date.now()}`;
      createdCollectionNames.push(collectionName);

      await collectionsPage.createNewCollection(collectionName);

      await collectionsPage.waitForCollectionsGridToLoad();

      await collectionsPage.expectCollectionToBeVisible(collectionName);

      await collectionsPage.clickCollectionTile(collectionName);

      await collectionsPage.expectToBeOnCollectionDetailPage();

      await collectionsPage.expectRemoveCollectionButtonToBeVisible();

      await collectionsPage.clickRemoveCollection();

      await collectionsPage.expectRemoveCollectionDialogToBeVisible();

      await collectionsPage.clickCancelRemove();

      await collectionsPage.expectRemoveCollectionDialogNotToBeVisible();

      await collectionsPage.expectToBeOnCollectionDetailPage();

      await collectionsPage.goto();

      await collectionsPage.waitForCollectionsGridToLoad();

      await collectionsPage.expectCollectionToBeVisible(collectionName);
    });
  });
});
