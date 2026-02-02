const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('ERROR:', error.message));
  
  await page.goto('http://localhost:3000/test-modal');
  await page.waitForTimeout(2000);
  
  try {
    await page.click('button');
    await page.waitForTimeout(1000);
  } catch(e) { console.log('Click failed:', e.message); }
  
  await page.screenshot({ path: 'modal-debug.png' });
  await browser.close();
})();
