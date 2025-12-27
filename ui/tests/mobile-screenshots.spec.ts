import { test, expect, devices } from '@playwright/test';
import path from 'path';

// Configuration
const ARGOCD_URL = process.env.ARGOCD_URL || 'https://localhost:8080';
const ARGOCD_USERNAME = process.env.ARGOCD_USERNAME || 'admin';
const ARGOCD_PASSWORD = process.env.ARGOCD_PASSWORD || 'admin';
const SCREENSHOT_DIR = path.join(__dirname, '../playwright-screenshots');

// Test viewports
const viewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'iPhone 13 Pro Max', width: 428, height: 926 },
    { name: 'iPad Mini', width: 768, height: 1024 },
    { name: 'iPad Air', width: 820, height: 1180 },
    { name: 'Desktop HD', width: 1920, height: 1080 },
];

// Pages to screenshot
const pages = [
    { name: 'login', path: '/login', waitForSelector: 'input[type="password"]' },
    { name: 'applications', path: '/applications', waitForSelector: '.applications-list', requiresAuth: true },
    { name: 'settings', path: '/settings', waitForSelector: '.settings', requiresAuth: true },
];

test.describe('Mobile UI Visual Testing', () => {
    viewports.forEach(viewport => {
        test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
            test.use({
                viewport: { width: viewport.width, height: viewport.height },
                ignoreHTTPSErrors: true, // ArgoCD uses self-signed cert
            });

            pages.forEach(page => {
                test(`Screenshot: ${page.name}`, async ({ page: playPage }) => {
                    // Navigate to page
                    await playPage.goto(`${ARGOCD_URL}${page.path}`);

                    // Login if required
                    if (page.requiresAuth) {
                        // Check if we're on login page
                        const isLoginPage = await playPage.locator('input[name="username"]').isVisible().catch(() => false);

                        if (isLoginPage) {
                            await playPage.fill('input[name="username"]', ARGOCD_USERNAME);
                            await playPage.fill('input[name="password"]', ARGOCD_PASSWORD);
                            await playPage.click('button[type="submit"]');

                            // Wait for navigation
                            await playPage.waitForURL(/\/(applications|settings)/, { timeout: 10000 });

                            // Navigate to the actual page if we were redirected
                            if (!playPage.url().includes(page.path)) {
                                await playPage.goto(`${ARGOCD_URL}${page.path}`);
                            }
                        }
                    }

                    // Wait for page to load
                    if (page.waitForSelector) {
                        await playPage.waitForSelector(page.waitForSelector, { timeout: 15000 });
                    }

                    // Additional wait for any animations
                    await playPage.waitForTimeout(1000);

                    // Take full page screenshot
                    const screenshotPath = path.join(
                        SCREENSHOT_DIR,
                        viewport.name.replace(/\s+/g, '-'),
                        `${page.name}.png`
                    );

                    await playPage.screenshot({
                        path: screenshotPath,
                        fullPage: true,
                    });

                    console.log(`✓ Screenshot saved: ${screenshotPath}`);

                    // Verify page loaded correctly
                    if (page.requiresAuth) {
                        // Should not be on login page
                        const onLoginPage = await playPage.locator('input[name="username"]').isVisible().catch(() => false);
                        expect(onLoginPage).toBe(false);
                    }
                });
            });

            // Mobile-specific tests
            if (viewport.width < 640) {
                test('Mobile: Hamburger menu interaction', async ({ page: playPage }) => {
                    await playPage.goto(`${ARGOCD_URL}/login`);

                    // Login
                    await playPage.fill('input[name="username"]', ARGOCD_USERNAME);
                    await playPage.fill('input[name="password"]', ARGOCD_PASSWORD);
                    await playPage.click('button[type="submit"]');

                    await playPage.waitForURL(/\/applications/, { timeout: 10000 });
                    await playPage.waitForTimeout(1000);

                    // Screenshot: Menu closed
                    await playPage.screenshot({
                        path: path.join(
                            SCREENSHOT_DIR,
                            viewport.name.replace(/\s+/g, '-'),
                            'mobile-menu-closed.png'
                        ),
                        fullPage: true,
                    });

                    // Find and click hamburger menu
                    const hamburger = playPage.locator('.mobile-menu-button, button[aria-label="Toggle menu"]');
                    await expect(hamburger).toBeVisible({ timeout: 5000 });
                    await hamburger.click();

                    // Wait for sidebar animation
                    await playPage.waitForTimeout(500);

                    // Screenshot: Menu open
                    await playPage.screenshot({
                        path: path.join(
                            SCREENSHOT_DIR,
                            viewport.name.replace(/\s+/g, '-'),
                            'mobile-menu-open.png'
                        ),
                        fullPage: true,
                    });

                    // Verify overlay is visible
                    const overlay = playPage.locator('.sidebar-overlay');
                    await expect(overlay).toBeVisible();

                    // Click overlay to close
                    await overlay.click();
                    await playPage.waitForTimeout(500);

                    // Screenshot: Menu closed again
                    await playPage.screenshot({
                        path: path.join(
                            SCREENSHOT_DIR,
                            viewport.name.replace(/\s+/g, '-'),
                            'mobile-menu-closed-after.png'
                        ),
                        fullPage: true,
                    });
                });
            }

            // Desktop-specific tests
            if (viewport.width >= 1024) {
                test('Desktop: Sidebar collapse interaction', async ({ page: playPage }) => {
                    await playPage.goto(`${ARGOCD_URL}/login`);

                    // Login
                    await playPage.fill('input[name="username"]', ARGOCD_USERNAME);
                    await playPage.fill('input[name="password"]', ARGOCD_PASSWORD);
                    await playPage.click('button[type="submit"]');

                    await playPage.waitForURL(/\/applications/, { timeout: 10000 });
                    await playPage.waitForTimeout(1000);

                    // Screenshot: Sidebar expanded
                    await playPage.screenshot({
                        path: path.join(
                            SCREENSHOT_DIR,
                            viewport.name.replace(/\s+/g, '-'),
                            'desktop-sidebar-expanded.png'
                        ),
                        fullPage: true,
                    });

                    // Find and click collapse button
                    const collapseButton = playPage.locator('.sidebar__collapse-button');
                    await collapseButton.click();
                    await playPage.waitForTimeout(500);

                    // Screenshot: Sidebar collapsed
                    await playPage.screenshot({
                        path: path.join(
                            SCREENSHOT_DIR,
                            viewport.name.replace(/\s+/g, '-'),
                            'desktop-sidebar-collapsed.png'
                        ),
                        fullPage: true,
                    });
                });
            }
        });
    });
});

test.describe('Mobile UI Element Testing', () => {
    test.use({
        viewport: { width: 390, height: 844 }, // iPhone 12
        ignoreHTTPSErrors: true,
    });

    test('Touch target sizes', async ({ page }) => {
        await page.goto(`${ARGOCD_URL}/login`);

        // Login
        await page.fill('input[name="username"]', ARGOCD_USERNAME);
        await page.fill('input[name="password"]', ARGOCD_PASSWORD);
        await page.click('button[type="submit"]');

        await page.waitForURL(/\/applications/, { timeout: 10000 });
        await page.waitForTimeout(1000);

        // Check hamburger menu button size
        const hamburger = page.locator('.mobile-menu-button');
        const hamburgerBox = await hamburger.boundingBox();

        if (hamburgerBox) {
            expect(hamburgerBox.width).toBeGreaterThanOrEqual(44);
            expect(hamburgerBox.height).toBeGreaterThanOrEqual(44);
            console.log(`✓ Hamburger menu: ${hamburgerBox.width}x${hamburgerBox.height}px (meets 44px minimum)`);
        }

        // Check search input height
        const searchInput = page.locator('.applications-list__search input, input[placeholder*="Search"]');
        if (await searchInput.isVisible()) {
            const searchBox = await searchInput.boundingBox();
            if (searchBox) {
                expect(searchBox.height).toBeGreaterThanOrEqual(44);
                console.log(`✓ Search input: ${searchBox.height}px height (meets 44px minimum)`);
            }
        }
    });

    test('No horizontal scroll', async ({ page }) => {
        await page.goto(`${ARGOCD_URL}/login`);

        // Login
        await page.fill('input[name="username"]', ARGOCD_USERNAME);
        await page.fill('input[name="password"]', ARGOCD_PASSWORD);
        await page.click('button[type="submit"]');

        await page.waitForURL(/\/applications/, { timeout: 10000 });
        await page.waitForTimeout(1000);

        // Check for horizontal scrollbar
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px tolerance
        console.log(`✓ No horizontal scroll: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`);
    });
});
