// WCAG Contrast calculation
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const num = parseInt(hex, 16);
  return [num >> 16, (num >> 8) & 255, num & 255];
}

function getLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrast(hex1, hex2) {
  const l1 = getLuminance(hexToRgb(hex1));
  const l2 = getLuminance(hexToRgb(hex2));
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

const lightTheme = {
  bg: '#F4EEE1',
  card: '#FAF6EE',
  text: '#14213D',
  muted: '#455068',
  faint: '#5C667E',
  border: '#DCD5C8',
  stampRed: '#B3261E',
  stampGreen: '#235C40',
  stampOchre: '#8C5A00',
  btnPrimaryBg: '#14213D',
  btnPrimaryText: '#F4EEE1',
};

const darkTheme = {
  bg: '#0E1420',
  card: '#151D2C',
  text: '#F0EAE1',
  muted: '#B0B9C8',
  faint: '#8D97AB',
  border: '#273347',
  stampRed: '#F26C63',
  stampGreen: '#4BB77E',
  stampOchre: '#E5AD38',
  btnPrimaryBg: '#F0EAE1',
  btnPrimaryText: '#0E1420',
};

function audit(name, theme) {
  console.log(`=== WCAG CONTRAST AUDIT: ${name.toUpperCase()} ===`);
  const tests = [
    { label: 'Main Text on Background', fg: theme.text, bg: theme.bg, min: 4.5 },
    { label: 'Main Text on Card', fg: theme.text, bg: theme.card, min: 4.5 },
    { label: 'Muted Text on Card', fg: theme.muted, bg: theme.card, min: 4.5 },
    { label: 'Faint Text on Card (large/caption)', fg: theme.faint, bg: theme.card, min: 3.0 },
    { label: 'Stamp Red on Card', fg: theme.stampRed, bg: theme.card, min: 4.5 },
    { label: 'Stamp Green on Card', fg: theme.stampGreen, bg: theme.card, min: 4.5 },
    { label: 'Stamp Ochre on Card', fg: theme.stampOchre, bg: theme.card, min: 4.5 },
    { label: 'Primary Button Text on Bg', fg: theme.btnPrimaryText, bg: theme.btnPrimaryBg, min: 4.5 },
    { label: 'Card Border on Main Bg', fg: theme.border, bg: theme.bg, min: 1.2 }, // UI boundary min
  ];

  let passed = true;
  for (const t of tests) {
    const ratio = getContrast(t.fg, t.bg);
    const pass = ratio >= t.min;
    if (!pass) passed = false;
    console.log(`  ${t.label.padEnd(35)}: ${ratio.toFixed(2)}:1 (min ${t.min}:1) -> [${pass ? 'PASS' : 'FAIL'}]`);
  }
  console.log(`Result: ${passed ? 'ALL PASSED' : 'FAILURES DETECTED'}\n`);
  return passed;
}

const lightPass = audit('Light ("Customs Paper")', lightTheme);
const darkPass = audit('Dark ("Night Ledger")', darkTheme);

if (!lightPass || !darkPass) {
  process.exit(1);
}
