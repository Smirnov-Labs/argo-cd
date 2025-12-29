import {test, expect} from '@playwright/test';
import path from 'path';

// Configuration
const ARGOCD_URL = process.env.ARGOCD_URL || 'https://localhost:8080';
const ARGOCD_USERNAME = process.env.ARGOCD_USERNAME || 'admin';
const ARGOCD_PASSWORD = process.env.ARGOCD_PASSWORD || 'admin';
const SCREENSHOT_DIR = path.join(__dirname, '../playwright-screenshots');

// Test viewports
const viewports = [
    {name: 'iPhone SE', width: 375, height: 667},
    {name: 'iPhone 12', width: 390, height: 844},
    {name: 'iPhone 13 Pro Max', width: 428, height: 926},
    {name: 'iPad Mini', width: 768, height: 1024},
    {name: 'iPad Air', width: 820, height: 1180},
    {name: 'Desktop HD', width: 1920, height: 1080}
];

// Pages to screenshot
const pages = [
    {name: 'login', path: '/login', waitForSelector: 'input[type="password"]'},
    {name: 'applications', path: '/applications', waitForSelector: '.applications-list', requiresAuth: true},
    {name: 'settings', path: '/settings', waitForSelector: '.settings', requiresAuth: true}
];

// Helper function to login
async function login(page: any, url: string, username: string, password: string) {
    await page.goto(`${url}/login`);
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/applications/, {timeout: 10000});
    await page.waitForTimeout(1000);
}

test.describe('Mobile UI Visual Testing', () => {
    viewports.forEach(viewport => {
        test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
            test.use({
                viewport: {width: viewport.width, height: viewport.height},
                ignoreHTTPSErrors: true // ArgoCD uses self-signed cert
            });

            pages.forEach(page => {
                test(`Screenshot: ${page.name}`, async ({page: playPage}) => {
                    // Navigate to page
                    await playPage.goto(`${ARGOCD_URL}${page.path}`);

                    // Login if required
                    if (page.requiresAuth) {
                        // Check if we're on login page
                        const isLoginPage = await playPage
                            .locator('input[name="username"]')
                            .isVisible()
                            .catch(() => false);

                        if (isLoginPage) {
                            await playPage.fill('input[name="username"]', ARGOCD_USERNAME);
                            await playPage.fill('input[name="password"]', ARGOCD_PASSWORD);
                            await playPage.click('button[type="submit"]');

                            // Wait for navigation
                            await playPage.waitForURL(/\/(applications|settings)/, {timeout: 10000});

                            // Navigate to the actual page if we were redirected
                            if (!playPage.url().includes(page.path)) {
                                await playPage.goto(`${ARGOCD_URL}${page.path}`);
                            }
                        }
                    }

                    // Wait for page to load
                    if (page.waitForSelector) {
                        await playPage.waitForSelector(page.waitForSelector, {timeout: 15000});
                    }

                    // Additional wait for any animations
                    await playPage.waitForTimeout(1000);

                    // Take full page screenshot
                    const screenshotPath = path.join(SCREENSHOT_DIR, viewport.name.replace(/\s+/g, '-'), `${page.name}.png`);

                    await playPage.screenshot({
                        path: screenshotPath,
                        fullPage: true
                    });

                    console.log(`✓ Screenshot saved: ${screenshotPath}`);

                    // Verify page loaded correctly
                    if (page.requiresAuth) {
                        // Should not be on login page
                        const onLoginPage = await playPage
                            .locator('input[name="username"]')
                            .isVisible()
                            .catch(() => false);
                        expect(onLoginPage).toBe(false);
                    }
                });
            });

            // Mobile-specific tests
            if (viewport.width < 640) {
                test('Mobile: Hamburger menu interaction', async ({page: playPage}) => {
                    await playPage.goto(`${ARGOCD_URL}/login`);

                    // Login
                    await playPage.fill('input[name="username"]', ARGOCD_USERNAME);
                    await playPage.fill('input[name="password"]', ARGOCD_PASSWORD);
                    await playPage.click('button[type="submit"]');

                    await playPage.waitForURL(/\/applications/, {timeout: 10000});
                    await playPage.waitForTimeout(1000);

                    // Screenshot: Menu closed
                    await playPage.screenshot({
                        path: path.join(SCREENSHOT_DIR, viewport.name.replace(/\s+/g, '-'), 'mobile-menu-closed.png'),
                        fullPage: true
                    });

                    // Find and click hamburger menu
                    const hamburger = playPage.locator('.mobile-menu-button, button[aria-label="Toggle menu"]');
                    await expect(hamburger).toBeVisible({timeout: 5000});
                    await hamburger.click();

                    // Wait for sidebar animation
                    await playPage.waitForTimeout(500);

                    // Screenshot: Menu open
                    await playPage.screenshot({
                        path: path.join(SCREENSHOT_DIR, viewport.name.replace(/\s+/g, '-'), 'mobile-menu-open.png'),
                        fullPage: true
                    });

                    // Verify overlay is visible
                    const overlay = playPage.locator('.sidebar-overlay');
                    await expect(overlay).toBeVisible();

                    // Click overlay to close
                    await overlay.click();
                    await playPage.waitForTimeout(500);

                    // Screenshot: Menu closed again
                    await playPage.screenshot({
                        path: path.join(SCREENSHOT_DIR, viewport.name.replace(/\s+/g, '-'), 'mobile-menu-closed-after.png'),
                        fullPage: true
                    });
                });
            }

            // Desktop-specific tests
            if (viewport.width >= 1024) {
                test('Desktop: Sidebar collapse interaction', async ({page: playPage}) => {
                    await playPage.goto(`${ARGOCD_URL}/login`);

                    // Login
                    await playPage.fill('input[name="username"]', ARGOCD_USERNAME);
                    await playPage.fill('input[name="password"]', ARGOCD_PASSWORD);
                    await playPage.click('button[type="submit"]');

                    await playPage.waitForURL(/\/applications/, {timeout: 10000});
                    await playPage.waitForTimeout(1000);

                    // Screenshot: Sidebar expanded
                    await playPage.screenshot({
                        path: path.join(SCREENSHOT_DIR, viewport.name.replace(/\s+/g, '-'), 'desktop-sidebar-expanded.png'),
                        fullPage: true
                    });

                    // Find and click collapse button
                    const collapseButton = playPage.locator('.sidebar__collapse-button');
                    await collapseButton.click();
                    await playPage.waitForTimeout(500);

                    // Screenshot: Sidebar collapsed
                    await playPage.screenshot({
                        path: path.join(SCREENSHOT_DIR, viewport.name.replace(/\s+/g, '-'), 'desktop-sidebar-collapsed.png'),
                        fullPage: true
                    });
                });
            }
        });
    });
});

test.describe('Mobile UI Element Testing', () => {
    test.use({
        viewport: {width: 390, height: 844}, // iPhone 12
        ignoreHTTPSErrors: true
    });

    test('Touch target sizes', async ({page}) => {
        await page.goto(`${ARGOCD_URL}/login`);

        // Login
        await page.fill('input[name="username"]', ARGOCD_USERNAME);
        await page.fill('input[name="password"]', ARGOCD_PASSWORD);
        await page.click('button[type="submit"]');

        await page.waitForURL(/\/applications/, {timeout: 10000});
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

    test('No horizontal scroll', async ({page}) => {
        await page.goto(`${ARGOCD_URL}/login`);

        // Login
        await page.fill('input[name="username"]', ARGOCD_USERNAME);
        await page.fill('input[name="password"]', ARGOCD_PASSWORD);
        await page.click('button[type="submit"]');

        await page.waitForURL(/\/applications/, {timeout: 10000});
        await page.waitForTimeout(1000);

        // Check for horizontal scrollbar
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px tolerance
        console.log(`✓ No horizontal scroll: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`);
    });
});

// Mobile Application Details Screenshots
test.describe('Mobile Application Details Screenshots', () => {
    test.use({
        viewport: {width: 390, height: 844}, // iPhone 12
        ignoreHTTPSErrors: true
    });

    test.beforeEach(async ({page}) => {
        await login(page, ARGOCD_URL, ARGOCD_USERNAME, ARGOCD_PASSWORD);
    });

    test('Application Details - Tree View', async ({page}) => {
        // Navigate to an application (guestbook is commonly available)
        await page.goto(`${ARGOCD_URL}/applications/argocd/guestbook?view=tree`);
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'mobile', 'app-details-tree-view.png'),
            fullPage: true
        });
        console.log('✓ Screenshot: Application Details - Tree View');
    });

    test('Application Details - List View', async ({page}) => {
        await page.goto(`${ARGOCD_URL}/applications/argocd/guestbook?view=list`);
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'mobile', 'app-details-list-view.png'),
            fullPage: true
        });
        console.log('✓ Screenshot: Application Details - List View');
    });

    test('Application Details - Pods View', async ({page}) => {
        await page.goto(`${ARGOCD_URL}/applications/argocd/guestbook?view=pods`);
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'mobile', 'app-details-pods-view.png'),
            fullPage: true
        });
        console.log('✓ Screenshot: Application Details - Pods View');
    });

    test('Application Details - Network View', async ({page}) => {
        await page.goto(`${ARGOCD_URL}/applications/argocd/guestbook?view=network`);
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'mobile', 'app-details-network-view.png'),
            fullPage: true
        });
        console.log('✓ Screenshot: Application Details - Network View');
    });

    test('Mobile Action Bar - More Menu', async ({page}) => {
        await page.goto(`${ARGOCD_URL}/applications/argocd/guestbook?view=list`);
        await page.waitForTimeout(2000);

        // Click More button in action bar
        await page.click('.application-details__mobile-action:last-child');
        await page.waitForTimeout(500);

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'mobile', 'app-details-more-menu.png'),
            fullPage: true
        });
        console.log('✓ Screenshot: Mobile More Menu');
    });

    test('Sync Status Panel (MobilePanel)', async ({page}) => {
        await page.goto(`${ARGOCD_URL}/applications/argocd/guestbook?view=list`);
        await page.waitForTimeout(2000);

        // Click More button
        await page.click('.application-details__mobile-action:last-child');
        await page.waitForTimeout(500);

        // Click Sync Status
        await page.click('[qe-id="undefined-Sync Status"]');
        await page.waitForTimeout(1000);

        // Screenshot top of panel
        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'mobile', 'sync-status-panel-top.png'),
            fullPage: false
        });
        console.log('✓ Screenshot: Sync Status Panel (Top)');

        // Scroll to bottom of panel to see results
        await page.evaluate(() => {
            const body = document.querySelector('.mobile-panel__body');
            if (body) body.scrollTop = body.scrollHeight;
        });
        await page.waitForTimeout(500);

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'mobile', 'sync-status-panel-bottom.png'),
            fullPage: false
        });
        console.log('✓ Screenshot: Sync Status Panel (Bottom)');

        // Close panel
        await page.click('.mobile-panel__close');
        await page.waitForTimeout(500);
    });

    test('Sync Panel (MobilePanel)', async ({page}) => {
        await page.goto(`${ARGOCD_URL}/applications/argocd/guestbook?view=list`);
        await page.waitForTimeout(2000);

        // Click Sync button in action bar
        await page.click('.application-details__mobile-action:nth-child(3)');
        await page.waitForTimeout(1000);

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'mobile', 'sync-panel.png'),
            fullPage: false
        });
        console.log('✓ Screenshot: Sync Panel');

        // Close panel
        await page.click('.mobile-panel__close');
        await page.waitForTimeout(500);
    });

    test('Mobile Sidebar Open', async ({page}) => {
        await page.goto(`${ARGOCD_URL}/applications/argocd/guestbook?view=list`);
        await page.waitForTimeout(2000);

        // Click hamburger menu
        await page.click('.mobile-menu-button');
        await page.waitForTimeout(500);

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'mobile', 'sidebar-open.png'),
            fullPage: true
        });
        console.log('✓ Screenshot: Mobile Sidebar Open');

        // Close sidebar
        await page.click('.sidebar-overlay');
        await page.waitForTimeout(500);
    });

    test('Application Filter Panel', async ({page}) => {
        await page.goto(`${ARGOCD_URL}/applications`);
        await page.waitForTimeout(2000);

        // Look for filter button and click it
        const filterButton = page.locator('.applications-list__filters button, [class*="filter"]').first();
        if (await filterButton.isVisible()) {
            await filterButton.click();
            await page.waitForTimeout(500);

            await page.screenshot({
                path: path.join(SCREENSHOT_DIR, 'mobile', 'filter-panel.png'),
                fullPage: true
            });
            console.log('✓ Screenshot: Filter Panel');
        }
    });
});

// Comprehensive mobile screenshots for PR documentation
test.describe('PR Documentation Screenshots', () => {
    test.use({
        viewport: {width: 390, height: 844},
        ignoreHTTPSErrors: true
    });

    test('Generate all mobile screenshots for PR', async ({page}) => {
        await login(page, ARGOCD_URL, ARGOCD_USERNAME, ARGOCD_PASSWORD);

        const screenshots: {name: string; action: () => Promise<void>}[] = [
            {
                name: '01-applications-list',
                action: async () => {
                    await page.goto(`${ARGOCD_URL}/applications`);
                    await page.waitForTimeout(2000);
                }
            },
            {
                name: '02-app-details-tree',
                action: async () => {
                    await page.goto(`${ARGOCD_URL}/applications/argocd/guestbook?view=tree`);
                    await page.waitForTimeout(2000);
                }
            },
            {
                name: '03-app-details-list',
                action: async () => {
                    await page.goto(`${ARGOCD_URL}/applications/argocd/guestbook?view=list`);
                    await page.waitForTimeout(2000);
                }
            },
            {
                name: '04-app-details-pods',
                action: async () => {
                    await page.goto(`${ARGOCD_URL}/applications/argocd/guestbook?view=pods`);
                    await page.waitForTimeout(2000);
                }
            },
            {
                name: '05-app-details-network',
                action: async () => {
                    await page.goto(`${ARGOCD_URL}/applications/argocd/guestbook?view=network`);
                    await page.waitForTimeout(2000);
                }
            },
            {
                name: '06-mobile-sidebar',
                action: async () => {
                    await page.goto(`${ARGOCD_URL}/applications/argocd/guestbook?view=list`);
                    await page.waitForTimeout(1000);
                    await page.click('.mobile-menu-button');
                    await page.waitForTimeout(500);
                }
            },
            {
                name: '07-more-menu',
                action: async () => {
                    await page.goto(`${ARGOCD_URL}/applications/argocd/guestbook?view=list`);
                    await page.waitForTimeout(1000);
                    await page.click('.application-details__mobile-action:last-child');
                    await page.waitForTimeout(500);
                }
            },
            {
                name: '08-sync-status-panel',
                action: async () => {
                    await page.goto(`${ARGOCD_URL}/applications/argocd/guestbook?view=list`);
                    await page.waitForTimeout(1000);
                    await page.click('.application-details__mobile-action:last-child');
                    await page.waitForTimeout(300);
                    await page.click('[qe-id="undefined-Sync Status"]');
                    await page.waitForTimeout(1000);
                }
            },
            {
                name: '09-sync-panel',
                action: async () => {
                    await page.goto(`${ARGOCD_URL}/applications/argocd/guestbook?view=list`);
                    await page.waitForTimeout(1000);
                    await page.click('.application-details__mobile-action:nth-child(3)');
                    await page.waitForTimeout(1000);
                }
            }
        ];

        for (const screenshot of screenshots) {
            try {
                await screenshot.action();
                await page.screenshot({
                    path: path.join(SCREENSHOT_DIR, 'pr-docs', `${screenshot.name}.png`),
                    fullPage: false
                });
                console.log(`✓ ${screenshot.name}`);
            } catch (e) {
                console.log(`✗ ${screenshot.name}: ${e.message}`);
            }
        }
    });
});
