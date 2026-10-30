import { expect, test } from "@playwright/test";
import { INVALID_USER, TEST_USER } from "./fixtures/test_users";
import { HomePage } from "./pages/home_page";

test.describe("Login functionality", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test("should successfully log in with valid credentials", async () => {
    await homePage.openLoginDialog();

    await homePage.loginComponent.expectDialogToBeVisible();

    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);

    await homePage.loginComponent.expectSuccessMessage();

    await homePage.loginComponent.expectDialogToBeHidden();
  });

  test("should display error with invalid credentials", async () => {
    await homePage.openLoginDialog();

    await homePage.loginComponent.login(INVALID_USER.email, INVALID_USER.password);

    await homePage.loginComponent.expectErrorMessage("Invalid email or password");

    await homePage.loginComponent.expectDialogToBeVisible();
  });

  test("should validate empty email field", async () => {
    await homePage.openLoginDialog();

    await homePage.loginComponent.fillPassword(TEST_USER.password);

    await homePage.loginComponent.clickSubmit();

    await homePage.loginComponent.expectEmailValidationError();
  });

  test("should validate invalid email format", async () => {
    await homePage.openLoginDialog();

    await homePage.loginComponent.fillEmail("invalid-email");
    await homePage.loginComponent.fillPassword(TEST_USER.password);

    await homePage.loginComponent.clickSubmit();

    await homePage.loginComponent.expectInvalidEmailFormatError();
  });

  test("should validate empty password field", async () => {
    await homePage.openLoginDialog();

    await homePage.loginComponent.fillEmail(TEST_USER.email);

    await homePage.loginComponent.clickSubmit();

    await homePage.loginComponent.expectPasswordValidationError();
  });

  test("should persist session after page refresh", async ({ page }) => {
    await homePage.openLoginDialog();

    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);

    await page.waitForTimeout(2000);

    await page.reload();

    await homePage.expectLoginButtonToBeHidden();
  });

  test("should set authentication cookie on successful login", async ({ page, context }) => {
    await homePage.openLoginDialog();

    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);

    await page.waitForTimeout(2000);

    const cookies = await context.cookies();
    const userCookie = cookies.find((cookie) => cookie.name === "user");

    expect(userCookie).toBeDefined();
    expect(userCookie?.value).toBeTruthy();
    expect(userCookie?.path).toBe("/");
    expect(userCookie?.sameSite).toBe("Lax");
  });

  test("should close dialog when clicking outside", async () => {
    await homePage.openLoginDialog();

    await homePage.loginComponent.expectDialogToBeVisible();

    await homePage.loginComponent.closeWithEscape();

    await homePage.loginComponent.expectDialogToBeHidden();
  });

  test("should allow typing in email and password fields", async () => {
    await homePage.openLoginDialog();

    await homePage.loginComponent.fillEmail(TEST_USER.email);
    await homePage.loginComponent.expectEmailValue(TEST_USER.email);

    await homePage.loginComponent.fillPassword(TEST_USER.password);
    await homePage.loginComponent.expectPasswordValue(TEST_USER.password);
  });
});
