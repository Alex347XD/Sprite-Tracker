const fs = require('fs');
const origin = 'https://spritechecklist.org';

(async () => {
  // reuse extraction minimal: just fetch bundle and check themes in ts/ls/hs
  const response = await fetch(origin + '/', { cache: 'no-store' });
  const html = await response.text();
  const wrapperMatch = html.match(/\/_astro\/Tracker\.[A-Za-z0-9_-]+\.js/);
  const wrapperResponse = await fetch(origin + wrapperMatch[0], { cache: 'no-store' });
  const wrapperText = await wrapperResponse.text();
  const originalMatch = wrapperText.match(/\.\/Tracker\.[A-Za-z0-9_-]+\.js/) || wrapperText.match(/Tracker\.[A-Za-z0-9_-]+\.js/);
  const originalFile = originalMatch[0].replace(/^\.\//, '');
  const bundleResponse = await fetch(origin + '/_astro/' + originalFile, { cache: 'no-store' });
  const bundle = await bundleResponse.text();
  // check for 'Rift' or 'Cube' in bundle
  console.log('has Cube:', bundle.includes('Cube'));
  console.log('has Rift:', bundle.includes('Rift'));
})();
