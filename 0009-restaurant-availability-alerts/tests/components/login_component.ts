import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class LoginComponent {
  public readonly page: Page;
  public readonly dialog: Locator;
  public readonly emailInput: Locator;
  public readonly passwordInput: Locator;
  public readonly submitButton: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByTestId("login-dialog");
    this.emailInput = page.getByTestId("login-email-input");
    this.passwordInput = page.getByTestId("login-password-input");
    this.submitButton = page.getByTestId("login-submit-button");
  }

  public async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  public async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  public async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  public async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSubmit();
  }

  public async expectDialogToBeVisible(): Promise<void> {
    await expect(this.dialog).toBeVisible();
  }

  public async expectDialogToBeHidden(): Promise<void> {
    await expect(this.dialog).not.toBeVisible();
  }

  public async expectSuccessMessage(): Promise<void> {
    await expect(this.page.getByText("Welcome back! 👋").or(this.page.getByText("Welcome back!"))).toBeVisible({
      timeout: 10000
    });
  }

  public async expectErrorMessage(message: string): Promise<void> {
    await expect(this.page.getByText(message).first()).toBeVisible();
  }

  public async expectEmailValidationError(): Promise<void> {
    await expect(
      this.page.getByText("Email is required").or(this.page.getByText("Please enter a valid email"))
    ).toBeVisible();
  }

  public async expectInvalidEmailFormatError(): Promise<void> {
    await expect(
      this.page.getByText("Please enter a valid email").or(this.page.getByText("Invalid email"))
    ).toBeVisible();
  }

  public async expectPasswordValidationError(): Promise<void> {
    await expect(
      this.page.getByText("Password is required").or(this.page.getByText("Please enter your password"))
    ).toBeVisible();
  }

  public async expectEmailValue(expectedValue: string): Promise<void> {
    await expect(this.emailInput).toHaveValue(expectedValue);
  }

  public async expectPasswordValue(expectedValue: string): Promise<void> {
    await expect(this.passwordInput).toHaveValue(expectedValue);
  }

  public async expectSubmitButtonToBeDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
  }

  public async closeWithEscape(): Promise<void> {
    await this.page.keyboard.press("Escape");
  }
}
