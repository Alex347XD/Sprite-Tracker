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

  const keyIdx = bundle.indexOf('ts=[');
  const markerIdx = bundle.indexOf('],Ne=', keyIdx);
  const arrTextRaw = bundle.slice(keyIdx + 3, markerIdx + 1);
  const cleaned = arrTextRaw.replace(/\.\.\.[A-Za-z_$][\w$]*,?/g, '');
  const entries = new Function('return ' + cleaned)();
  console.log('ts count:', entries.length);
  console.log('ts ids:', entries.map(e=>e.id).join(', '));
})();
