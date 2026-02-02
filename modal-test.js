const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/test-modal');
  await page.click('text=Open Modal');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-modal-open.png', fullPage: true });
  await browser.close();
})();
