import { expect, test } from "@playwright/test";

test("login screen and PWA metadata render", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
  await expect(page).toHaveTitle(/Bar Ops/i);
});

test("mobile layout has no horizontal overflow", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
