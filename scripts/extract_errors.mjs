import fs from 'fs';
import path from 'path';

const files = ['contracts/ShipEscrow.py', 'contracts/ShipReputation.py'];
const errors = new Set();

for (const rel of files) {
  const content = fs.readFileSync(path.resolve(rel), 'utf8');
  // Match raise gl.vm.UserError("...") or raise gl.vm.UserError('...') or f-strings
  const regex = /raise gl\.vm\.UserError\((f?["'])(.*?)\1\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    errors.add(match[2]);
  }
}

console.log(`Total unique UserError expressions: ${errors.size}`);
for (const err of Array.from(errors).sort()) {
  console.log(`- "${err}"`);
}
