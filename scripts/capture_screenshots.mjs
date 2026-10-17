import { chromium } from 'playwright-core';
import { createServer } from 'vite';
import fs from 'fs';
import path from 'path';

const targetDir = process.argv[2] || 'docs/design/before';
const executablePath = 'C:/Users/USER/.cache/puppeteer/chrome/win64-155.0.8059.79/chrome-win64/chrome.exe';

const routes = [
  { path: '/', name: 'landing' },
  { path: '/app', name: 'app-board' },
  { path: '/app/create', name: 'app-create' },
  { path: '/app/bounty/14', name: 'app-bounty-14' },
  { path: '/app/evidence', name: 'app-evidence' },
  { path: '/app/reputation', name: 'app-reputation' },
];

const viewports = [
  { name: '1440px', width: 1440, height: 900 },
  { name: '390px', width: 390, height: 844 },
];

const themes = ['light', 'dark'];

async function main() {
  console.log(`=== CAPTURING SCREENSHOTS TO ${targetDir} ===\n`);
  fs.mkdirSync(targetDir, { recursive: true });

  const server = await createServer({
    server: { port: 5175 },
  });
  await server.listen();
  const address = server.httpServer.address();
  const baseUrl = `http://localhost:${address.port}`;
  console.log(`Vite server running at ${baseUrl}`);

  const browser = await chromium.launch({
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const captured = [];

  for (const vp of viewports) {
    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: theme,
      });

      for (const route of routes) {
        const page = await context.newPage();
        const url = `${baseUrl}${route.path}`;
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
          
          await page.evaluate((th) => {
            localStorage.setItem('ship-theme', th);
            document.documentElement.setAttribute('data-theme', th);
          }, theme);
          
          // Wait 2.5s for data to render
          await new Promise(r => setTimeout(r, 2500));

          const fileName = `${route.name}_${vp.name}_${theme}.png`;
          const filePath = path.join(targetDir, fileName);
          await page.screenshot({ path: filePath, fullPage: false });

          const stats = fs.statSync(filePath);
          captured.push({ fileName, size: stats.size });
          console.log(`Saved ${fileName} (${stats.size} bytes)`);
        } catch (err) {
          console.error(`Error capturing ${route.name} at ${vp.name} ${theme}:`, err.message);
        } finally {
          await page.close();
        }
      }
      await context.close();
    }
  }

  await browser.close();
  await server.close();

  console.log(`\nSuccessfully captured ${captured.length} screenshots to ${targetDir}.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
