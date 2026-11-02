import { defineConfig, devices } from "@playwright/test";
import * as path from "path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Playwright config for running tests from within a task directory
 * Usage: cd results/task_0000/app && npx playwright test
 */
export default defineConfig({
  // Look for tests in __tests__ directory relative to where command is run
  testDir: "./__tests__",
  testMatch: "**/*.spec.ts",

  // Test execution settings
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  // Timeout settings
  timeout: 30000, // 30 seconds per test
  expect: {
    timeout: 5000 // 5 seconds for assertions
  },

  // Reporter configuration
  reporter: [
    ["list"],
    ["html", { outputFolder: `/tmp/out/${process.env.PROBLEM_ID || 'unknown'}/${process.env.TEST_NAME || 'unknown'}/html-report`, open: "never" }],
    ["json", { outputFile: `/tmp/out/${process.env.PROBLEM_ID || 'unknown'}/${process.env.TEST_NAME || 'unknown'}/results.json` }]
  ],

  // Global test configuration
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10000, // 10 seconds for actions
  },

  // Browser projects
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],

  // Web server configuration - starts the dev server automatically
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes to start
    stdout: "pipe",
    stderr: "pipe",
  },

  // Output directory for test artifacts
  outputDir: `/tmp/out/${process.env.PROBLEM_ID || 'unknown'}/${process.env.TEST_NAME || 'unknown'}/artifacts`
});
