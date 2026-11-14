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

  const spriteVarMatches = [...bundle.matchAll(/sprites:([a-zA-Z_$][\w$]*)/g)];
  const varToSeasonId = {};
  for (const m of spriteVarMatches) {
    const varName = m[1];
    const idx = m.index;
    const start = bundle.lastIndexOf('{', idx);
    const end = bundle.indexOf('}', idx);
    const obj = bundle.slice(start, end + 1);
    const sidMatch = obj.match(/seasonId:"([^"]+)"/);
    if (sidMatch) varToSeasonId[varName] = sidMatch[1];
  }
  const arrayVars = [...new Set([...bundle.matchAll(/\b([a-zA-Z_$][\w$]*)=\[{id:"/g)].map(m => m[1]))];
  console.log('varToSeasonId', varToSeasonId);
  console.log('arrayVars', arrayVars);
})();
