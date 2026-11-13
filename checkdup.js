const fs = require('fs');
const origin = 'https://spritechecklist.org';

(async () => {
  // replicate adapter quickly by requiring? Just fetch and count ids
  const response = await fetch(origin + '/', { cache: 'no-store' });
  const html = await response.text();
  const wrapperMatch = html.match(/\/_astro\/Tracker\.[A-Za-z0-9_-]+\.js/);
  const wrapperResponse = await fetch(origin + wrapperMatch[0], { cache: 'no-store' });
  const wrapperText = await wrapperResponse.text();
  const originalMatch = wrapperText.match(/\.\/Tracker\.[A-Za-z0-9_-]+\.js/) || wrapperText.match(/Tracker\.[A-Za-z0-9_-]+\.js/);
  const originalFile = originalMatch[0].replace(/^\.\//, '');
  const bundleResponse = await fetch(origin + '/_astro/' + originalFile, { cache: 'no-store' });
  const bundle = await bundleResponse.text();

  // We can't easily run the full adapter here, but we can import app.js? No.
  // Instead, just check the generated sprites.json if updated
  const data = JSON.parse(fs.readFileSync('sprites.json','utf8'));
  const ids = data.map(s=>s.id);
  const seen = new Set();
  const dups = [];
  for (const id of ids) {
    if (seen.has(id)) dups.push(id);
    seen.add(id);
  }
  console.log('total:', ids.length, 'unique:', seen.size, 'dups:', dups);
})();
