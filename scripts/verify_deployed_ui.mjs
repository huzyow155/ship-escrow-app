import puppeteer from 'puppeteer';

const baseUrl = 'https://ship-escrow-app.vercel.app';
const routes = [
  '/app/bounty/14',
  '/app/evidence',
  '/app/reputation',
];

async function run() {
  console.log('=== VERIFYING DEPLOYED UI ===\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      channel: 'chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }).catch(() => puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }));
  } catch (err) {
    console.error('Failed to launch browser:', err);
    process.exit(1);
  }

  try {
    for (const route of routes) {
      const page = await browser.newPage();
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      page.on('pageerror', err => {
        consoleErrors.push(err.message);
      });

      console.log(`--- Visiting ${baseUrl}${route} ---`);
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle0', timeout: 30000 });
      // wait extra 2s for any contract view calls to settle
      await new Promise(r => setTimeout(r, 2000));

      const visibleText = await page.evaluate(() => document.body.innerText);
      const cleanedText = visibleText.replace(/\s+/g, ' ').trim();
      console.log(`[Visible text (first 600 chars)]:`);
      console.log(cleanedText.slice(0, 600));
      console.log(`\n[Console errors count]: ${consoleErrors.length}`);
      if (consoleErrors.length > 0) {
        consoleErrors.forEach((e, idx) => console.log(`  Error ${idx + 1}: ${e}`));
      }
      console.log('');

      if (route === '/app/bounty/14') {
        console.log('--- Testing Settlement Check Tool on /app/bounty/14 ---');
        // Find "Verify Settlement On-Chain" button
        const buttons = await page.$$('button');
        let verifyBtn = null;
        let mutateBtn = null;
        for (const btn of buttons) {
          const txt = await page.evaluate(el => el.innerText, btn);
          if (txt.includes('Verify Settlement On-Chain')) verifyBtn = btn;
          if (txt.includes('Mutate 1 Char')) mutateBtn = btn;
        }

        if (!verifyBtn || !mutateBtn) {
          console.error('Could not find verify or mutate button!');
        } else {
          // 1. Click Verify Settlement On-Chain
          await verifyBtn.click();
          await new Promise(r => setTimeout(r, 3000));
          let statusText1 = await page.evaluate(() => {
            const body = document.body.innerText;
            if (body.includes('✓ VERIFIED: TRUE')) return '✓ VERIFIED: TRUE';
            if (body.includes('✗ MISMATCH: FALSE')) return '✗ MISMATCH: FALSE';
            return 'NOT_FOUND';
          });
          console.log(`Initial Verification Result: ${statusText1}`);

          // 2. Click Mutate 1 Char
          await mutateBtn.click();
          await new Promise(r => setTimeout(r, 1000));

          // 3. Click Verify Settlement On-Chain again
          await verifyBtn.click();
          await new Promise(r => setTimeout(r, 3000));
          let statusText2 = await page.evaluate(() => {
            const body = document.body.innerText;
            if (body.includes('✓ VERIFIED: TRUE')) return '✓ VERIFIED: TRUE';
            if (body.includes('✗ MISMATCH: FALSE')) return '✗ MISMATCH: FALSE';
            return 'NOT_FOUND';
          });
          console.log(`Post-Mutation Verification Result: ${statusText2}`);
        }
        console.log('');
      }

      await page.close();
    }
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
