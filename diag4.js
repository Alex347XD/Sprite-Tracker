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

  // find hs array (Override season)
  const keyIdx = bundle.indexOf('hs=[');
  const markerIdx = bundle.indexOf('}],', keyIdx);
  const arrTextRaw = bundle.slice(keyIdx + 3, markerIdx + 2);
  console.log('raw head:', arrTextRaw.slice(0, 300));
  // find spread patterns
  const spreads = [...new Set(arrTextRaw.match(/\.\.\.[A-Za-z_$][\w$]*/g))];
  console.log('spreads:', spreads);
  // find 'he' context
  const i = arrTextRaw.indexOf('he');
  if (i !== -1) console.log('he context:', arrTextRaw.slice(Math.max(0, i-40), i+40));
})();
