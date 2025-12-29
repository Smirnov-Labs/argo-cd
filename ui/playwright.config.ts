import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    outputDir: './playwright-results',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 2 : undefined,
    reporter: [['html', {outputFolder: 'playwright-report'}], ['list']],

    use: {
        baseURL: process.env.ARGOCD_URL || 'https://localhost:8080',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        ignoreHTTPSErrors: true
    },

    projects: [
        {
            name: 'mobile-screenshots',
            testMatch: 'mobile-screenshots.spec.ts',
            use: {
                ...devices['iPhone 12'],
                // Use chromium instead of webkit for better compatibility
                browserName: 'chromium'
            }
        }
    ]
});
