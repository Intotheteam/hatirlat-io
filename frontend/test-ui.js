const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('response', async response => {
        if (response.url().includes('/api/reminders') && response.status() >= 400) {
            console.log('API RESPONSE STATUS:', response.status());
            try {
                console.log('API ERROR BODY:', await response.text());
            } catch (e) { }
        }
    });

    try {
        console.log('Navigating to login...');
        await page.goto('http://localhost:3000/login');
        await page.fill('input[type="email"]', 'testuser3@hatirlat.io');
        await page.fill('input[type="password"]', 'password');
        await page.click('button[type="submit"]');

        console.log('Waiting for dashboard...');
        await page.waitForURL('http://localhost:3000/dashboard');

        console.log('Navigating to schedules...');
        await page.goto('http://localhost:3000/schedules');

        console.log('Opening create modal...');
        await page.click('button:has-text("Yeni Hatırlatıcı")');
        await page.waitForTimeout(500);

        console.log('Filling form...');
        await page.fill('input[name="title"]', 'Test Validation');
        await page.fill('input[name="name"]', 'John Doe');
        await page.fill('textarea[name="message"]', 'Hello message');

        // Fill datetime local with a valid string
        await page.evaluate(() => {
            document.querySelector('input[name="dateTime"]').value = '2026-12-12T12:00';
        });

        console.log('Submitting...');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);

    } catch (err) {
        console.error('Test error:', err);
    } finally {
        await browser.close();
    }
})();
