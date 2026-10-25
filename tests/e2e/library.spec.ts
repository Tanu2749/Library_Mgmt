import { test, expect } from "@playwright/test";

test.describe("Athenaeum Library E2E Suite", () => {
  test("1. Home page renders hero, branding, and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Athenaeum/i);
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("h1")).toContainText(/Where timeless knowledge meets/i);
  });

  test("2. Theme toggle changes theme mode class", async ({ page }) => {
    await page.goto("/");
    const themeButton = page.locator("button[aria-label*='Switch to']");
    await expect(themeButton).toBeVisible();

    const html = page.locator("html");
    const initialClass = (await html.getAttribute("class")) || "";

    await themeButton.click();
    await page.waitForTimeout(300);

    const newClass = (await html.getAttribute("class")) || "";
    expect(newClass).not.toBe(initialClass);
  });

  test("3. Mobile viewport renders bottom navigation bar", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const mobileNav = page.locator("nav[aria-label='Mobile Navigation']");
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByText("Home")).toBeVisible();
    await expect(mobileNav.getByText("Catalog")).toBeVisible();
    await expect(mobileNav.getByText("Athena AI")).toBeVisible();
  });

  test("4. 3D Scene Fallback renders gracefully on reduced-motion / fallback", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    // The curated bookshelf fallback should be visible
    const fallbackShelf = page.getByText("Curated Bookshelf");
    await expect(fallbackShelf).toBeVisible();
  });

  test("5. Catalog search navigates and filters", async ({ page }) => {
    await page.goto("/catalog");
    await expect(page.locator("h1")).toContainText(/Browse Catalog/i);

    const searchInput = page.locator("input[name='query']");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Dune");
    await page.locator("button[type='submit']").click();

    await page.waitForURL(/query=Dune/);
    await expect(page.locator("body")).toContainText("Dune");
  });

  test("6. Login page provides fast demo autofill buttons", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText(/Sign In/i);

    const adminBtn = page.getByRole("button", { name: /Admin/i });
    await expect(adminBtn).toBeVisible();
    await adminBtn.click();

    const emailInput = page.locator("input[type='email']");
    await expect(emailInput).toHaveValue("admin@demo.com");
  });

  test("7. AI Librarian chat interface loads with quick prompts", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.locator("h1")).toContainText(/Athena, AI Librarian/i);
    await expect(page.getByText("Books like Atomic Habits but fiction")).toBeVisible();
  });
});
