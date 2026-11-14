const origin = 'https://spritechecklist.org';

(async () => {
  const response = await fetch(origin + '/', { cache: 'no-store' });
  const html = await response.text();
  const wrapperMatch = html.match(/\/_astro\/Tracker\.[A-Za-z0-9_-]+\.js/);
  const wrapperResponse = await fetch(origin + wrapperMatch[0], { cache: 'no-store' });
  const wrapperText = await wrapperResponse.text();
  const originalMatch = wrapperText.match(/\.\/Tracker\.[A-Za-z0-9_-]+\.js/) || wrapperText.match(/Tracker\.[A-Za-z0-9_-]+\.js/);
  const originalFile = originalMatch[0].replace(/^\.\//, '');
  const bundleResponse = await fetch(origin + '/_astro/' + originalFile, { cache: 'no-store' });
  const bundle = await bundleResponse.text();
  // find seasonId occurrences
  const seasonIds = [];
  let j = bundle.indexOf('seasonId');
  while (j !== -1) {
    seasonIds.push({idx: j, snippet: bundle.slice(j-30, j+40)});
    j = bundle.indexOf('seasonId', j+1);
  }
  console.log('seasonId count:', seasonIds.length);
  console.log(JSON.stringify(seasonIds.slice(0,8), null, 2));
  // find hs= or similar array for th
  console.log('has hs=[', bundle.includes('hs=['));
  console.log('has ls=[', bundle.includes('ls=['));
  console.log('has ts=[', bundle.includes('ts=['));
})();
