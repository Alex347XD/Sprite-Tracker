const fs = require('fs');
const p = 'js/app.js';
const lines = fs.readFileSync(p, 'utf8').split(/\n/);
// keep line endings by reconstructing
const text = fs.readFileSync(p, 'utf8');
const lines2 = text.split(/\n/);
let start = -1, end = -1;
for (let i = 0; i < lines2.length; i++) {
  if (lines2[i].includes('const riftSprites = [')) start = i;
  if (start !== -1 && lines2[i].includes('const normalized = normalizeSpriteList(sprites);')) { end = i; break; }
}
console.log('start', start, 'end', end);
const newLines = lines2.slice(0, start).concat(lines2.slice(end));
fs.writeFileSync(p, newLines.join('\n'));
console.log('done');
