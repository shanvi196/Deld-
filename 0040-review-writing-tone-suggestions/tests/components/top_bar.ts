import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class TopBar {
  public readonly page: Page;

  // User Avatar Menu
  public readonly userAvatarMenuTrigger: Locator;
  public readonly userAvatarMenu: Locator;
  public readonly userAvatarMenuCollections: Locator;
  public readonly userAvatarMenuReviews: Locator;
  public readonly userAvatarMenuLogout: Locator;

  public constructor(page: Page) {
    this.page = page;

    // User Avatar Menu
    this.userAvatarMenuTrigger = page.getByTestId("user-avatar-menu-trigger");
    this.userAvatarMenu = page.getByTestId("user-avatar-menu");
    this.userAvatarMenuCollections = page.getByTestId("user-avatar-menu-collections");
    this.userAvatarMenuReviews = page.getByTestId("user-avatar-menu-reviews");
    this.userAvatarMenuLogout = page.getByTestId("user-avatar-menu-logout");
  }

  // User Avatar Menu Methods
  public async openUserMenu(): Promise<void> {
    await this.userAvatarMenuTrigger.click();
    await this.page.waitForTimeout(500);
  }

  public async clickMyReviews(): Promise<void> {
    await this.userAvatarMenuReviews.click();
    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('domcontentloaded');
  }

  public async clickMyCollections(): Promise<void> {
    await this.userAvatarMenuCollections.click();
    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('domcontentloaded');
  }

  public async expectUserMenuToBeVisible(): Promise<void> {
    await expect(this.userAvatarMenu).toBeVisible();
  }

  public async expectUserAvatarToBeVisible(): Promise<void> {
    await expect(this.userAvatarMenuTrigger).toBeVisible();
  }

  public async expectUserAvatarToBeHidden(): Promise<void> {
    await expect(this.userAvatarMenuTrigger).not.toBeVisible();
  }
}
