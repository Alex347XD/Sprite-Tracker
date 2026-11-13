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
  const punk = entries.find(e => e.id === 'punk');
  console.log('punk themes:', punk.themes);
  console.log('punk releasedThemes:', punk.releasedThemes);
  // check gem sprites
  const gemPunks = entries.filter(e => e.id === 'punk' && (e.themes||[]).includes('Gem'));
  console.log('punk has gem?', gemPunks.length > 0);
  // list sprites that include Gem
  const withGem = entries.filter(e => (e.themes||[]).includes('Gem')).map(e=>e.id);
  console.log('sprites with Gem:', withGem.join(', '));
})();
