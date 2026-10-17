import puppeteer from 'puppeteer';
import { createServer } from 'vite';
import { readFileSync } from 'node:fs';

const axeSource = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');

const routes = [
  '/',
  '/app',
  '/app/create',
  '/app/evidence',
  '/app/reputation',
  '/app/limits',
  '/app/bounty/14',
];

async function main() {
  console.log('=== RUNNING CONSOLE ERRORS & ACCESSIBILITY AUDIT ===\n');

  // Start Vite dev server programmatically
  const server = await createServer({
    server: { port: 5173 },
  });
  await server.listen();
  const address = server.httpServer.address();
  const baseUrl = `http://localhost:${address.port}`;
  console.log(`Test server running at ${baseUrl}\n`);

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
    await server.close();
    process.exit(1);
  }

  let totalErrors = 0;
  let totalViolations = 0;

  for (const route of routes) {
    const page = await browser.newPage();
    const consoleErrors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore known benign network or favicon errors if any
        if (!text.includes('favicon.ico')) {
          consoleErrors.push(text);
        }
      }
    });

    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    const url = `${baseUrl}${route}`;
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Inject axe-core
    await page.evaluate(axeSource);

    // Run axe audit
    const results = await page.evaluate(async () => {
      // @ts-ignore
      return await window.axe.run({
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa'],
        },
      });
    });

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    console.log(`Route: ${route}`);
    console.log(`  Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((e) => console.log(`    - Error: ${e}`));
      totalErrors += consoleErrors.length;
    }

    console.log(`  Axe Critical/Serious Violations: ${criticalOrSerious.length}`);
    if (criticalOrSerious.length > 0) {
      criticalOrSerious.forEach((v) => {
        console.log(`    - [${v.impact.toUpperCase()}] ${v.id}: ${v.help}`);
        v.nodes.slice(0, 3).forEach((n) => console.log(`       target: ${n.target.join(' ')} | html: ${n.html}`));
      });
      totalViolations += criticalOrSerious.length;
    }

    await page.close();
  }

  await browser.close();
  await server.close();

  console.log('\n=== AUDIT SUMMARY ===');
  console.log(`Total Routes Checked: ${routes.length}`);
  console.log(`Total Console Errors: ${totalErrors}`);
  console.log(`Total Critical/Serious Axe Violations: ${totalViolations}`);

  if (totalErrors > 0 || totalViolations > 0) {
    console.error('\nAudit failed: Expected 0 console errors and 0 critical/serious violations.');
    process.exit(1);
  } else {
    console.log('\nAudit PASSED: 0 console errors without wallet, 0 critical/serious axe violations.');
  }
}

main().catch((err) => {
  console.error('Fatal error during audit:', err);
  process.exit(1);
});
