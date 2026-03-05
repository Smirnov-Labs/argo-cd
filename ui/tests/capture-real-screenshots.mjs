import {chromium, devices} from 'playwright';
import path from 'path';
import fs from 'fs';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:4000';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots-real');

const ARGOCD_USERNAME = 'admin';
const ARGOCD_PASSWORD = 'Lg85f0qFtyeX0bMz';

const viewports = [
    {name: 'iPhone-SE', ...devices['iPhone SE']},
    {name: 'iPhone-12', ...devices['iPhone 12']},
    {name: 'iPad-Mini', ...devices['iPad Mini']},
    {name: 'Desktop-1920', viewport: {width: 1920, height: 1080}},
];

async function login(page) {
    await page.goto(`${BASE_URL}/login`, {waitUntil: 'domcontentloaded', timeout: 15000});
    await page.waitForTimeout(3000);

    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');

    if (await usernameInput.isVisible({timeout: 5000})) {
        await usernameInput.fill(ARGOCD_USERNAME);
        await passwordInput.fill(ARGOCD_PASSWORD);
        await page.locator('button[type="submit"]').click();
        // Wait for redirect or content to load
        await page.waitForTimeout(5000);
    }
}

async function waitForContent(page, timeout = 10000) {
    // Wait for either app cards or any meaningful content
    try {
        await page.waitForSelector('.applications-list, .argo-table-list, .settings, .application-status-panel, .filters-group', {timeout});
    } catch {
        // If no specific selector found, just wait for the page to settle
        await page.waitForTimeout(3000);
    }
}

async function main() {
    fs.mkdirSync(SCREENSHOT_DIR, {recursive: true});

    const browser = await chromium.launch({headless: true});

    for (const vp of viewports) {
        console.log(`\n--- ${vp.name} ---`);
        const context = await browser.newContext({
            viewport: vp.viewport,
            userAgent: vp.userAgent,
            ignoreHTTPSErrors: true,
        });
        const page = await context.newPage();

        // Login
        await login(page);

        // Applications list
        console.log('  Capturing applications list...');
        await page.goto(`${BASE_URL}/applications`, {waitUntil: 'domcontentloaded', timeout: 15000});
        await waitForContent(page);
        await page.waitForTimeout(2000);
        await page.screenshot({path: path.join(SCREENSHOT_DIR, `${vp.name}_applications.png`), fullPage: false});
        console.log(`  Captured: ${vp.name}_applications.png`);

        // For mobile viewports, capture hamburger menu
        if (vp.viewport && vp.viewport.width < 640) {
            const menuBtn = page.locator('.mobile-menu-button');
            if (await menuBtn.isVisible({timeout: 3000}).catch(() => false)) {
                await menuBtn.click();
                await page.waitForTimeout(500);
                await page.screenshot({path: path.join(SCREENSHOT_DIR, `${vp.name}_menu-open.png`), fullPage: false});
                console.log(`  Captured: ${vp.name}_menu-open.png`);
                const closeBtn = page.locator('[aria-label="Close menu"]');
                if (await closeBtn.isVisible({timeout: 2000}).catch(() => false)) {
                    await closeBtn.click();
                    await page.waitForTimeout(500);
                }
            }
        }

        // Navigate directly to an app detail page
        console.log('  Capturing app detail...');
        await page.goto(`${BASE_URL}/applications/argocd/apcupsd`, {waitUntil: 'domcontentloaded', timeout: 15000});
        await page.waitForTimeout(5000);
        await page.screenshot({path: path.join(SCREENSHOT_DIR, `${vp.name}_app-detail.png`), fullPage: false});
        console.log(`  Captured: ${vp.name}_app-detail.png`);

        // Settings page
        console.log('  Capturing settings...');
        await page.goto(`${BASE_URL}/settings`, {waitUntil: 'domcontentloaded', timeout: 15000});
        await page.waitForTimeout(3000);
        await page.screenshot({path: path.join(SCREENSHOT_DIR, `${vp.name}_settings.png`), fullPage: false});
        console.log(`  Captured: ${vp.name}_settings.png`);

        await context.close();
    }

    await browser.close();
    console.log(`\nScreenshots saved to: ${SCREENSHOT_DIR}`);
}

main().catch(console.error);
