const fs = require('fs');
const app = fs.readFileSync('js/app.js', 'utf8');
const newFunc = fs.readFileSync('newfunc.txt', 'utf8');
const start = app.indexOf('async function fetchSpriteChecklistSprites(url) {');
const end = app.indexOf('async function fetchSpriteList(url, timeoutMs = 8000) {');
if (start === -1 || end === -1) { console.error('bounds not found'); process.exit(1); }
const result = app.slice(0, start) + newFunc + '\n' + app.slice(end);
fs.writeFileSync('js/app.js', result);
console.log('done');
