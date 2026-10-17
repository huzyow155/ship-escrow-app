import fs from 'fs';
import path from 'path';

// Budget limits
const BUDGETS = {
  'LandingPage.tsx': 160,
  'BountyBoardPage.tsx': 40,
  'CreateBountyPage.tsx': 40,
  'BountyDetailPage.tsx': 40,
  'EvidencePage.tsx': 40,
  'ReputationPage.tsx': 40,
  'LimitsPage.tsx': 40,
};

function extractStaticProse(content, fileName) {
  // Extract continuous narrative prose in paragraphs (<p>) and explanatory descriptions
  const lines = content.split('\n');
  const proseChunks = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('//') || line.startsWith('import') || line.startsWith('export ') || line.startsWith('const ') || line.startsWith('let ') || line.startsWith('function ')) {
      continue;
    }

    // Match narrative paragraphs or descriptive callout text
    if (fileName === 'LandingPage.tsx') {
      // For Landing page, extract hero description, pipeline descriptions, and boundary descriptions
      const pMatch = line.match(/<p[^>]*>([^<]+)<\/p>/);
      if (pMatch) proseChunks.push(pMatch[1].trim());

      const descMatch = line.match(/desc:\s*['"]([^'"]+)['"]/);
      if (descMatch) proseChunks.push(descMatch[1].trim());
    } else {
      // For /app pages, extract narrative prose from <p> tags
      const pMatch = line.match(/<p[^>]*>([^<]+)<\/p>/);
      if (pMatch) {
        const text = pMatch[1].trim();
        if (text && !text.startsWith('{')) {
          proseChunks.push(text);
        }
      }
    }
  }

  const fullText = proseChunks.join(' ');
  const words = fullText.split(/\s+/).filter(w => w.length > 0 && !/^[0-9#•\-_=]+$/.test(w));
  return { fullText, count: words.length, words };
}

function checkAll() {
  console.log('=== CHECKING STATIC PROSE WORD BUDGETS ===\n');
  const pagesDir = path.resolve('src/pages');
  let hasFailure = false;

  for (const [file, maxWords] of Object.entries(BUDGETS)) {
    const filePath = path.join(pagesDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${file}`);
      hasFailure = true;
      continue;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const { count, fullText } = extractStaticProse(content, file);
    const passed = count <= maxWords;
    if (!passed) hasFailure = true;

    console.log(`${file}: ${count} words / max ${maxWords} words [${passed ? 'PASS' : 'FAIL'}]`);
    if (count > 0) {
      console.log(`  Prose: "${fullText.slice(0, 120)}..."`);
    }
  }

  console.log(`\nResult: ${hasFailure ? 'FAILED: One or more pages exceed budget.' : 'PASSED: All pages meet word budgets.'}`);
  if (hasFailure) process.exit(1);
}

checkAll();
