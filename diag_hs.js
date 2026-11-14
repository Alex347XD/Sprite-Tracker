const origin = 'https://spritechecklist.org';

(async () => {
  const response = await fetch(origin + '/', { cache: 'no-store' });
  const html = await response.text();
  const wrapperMatch = html.match(/\/_astro\/Tracker\.[A-Za-z0-9_-]+\.js/);
  console.log('wrapperMatch', wrapperMatch && wrapperMatch[0]);
  const wrapperResponse = await fetch(origin + wrapperMatch[0], { cache: 'no-store' });
  const wrapperText = await wrapperResponse.text();
  const originalMatch = wrapperText.match(/\.\/Tracker\.[A-Za-z0-9_-]+\.js/) || wrapperText.match(/Tracker\.[A-Za-z0-9_-]+\.js/);
  console.log('originalMatch', originalMatch && originalMatch[0]);
  const originalFile = originalMatch[0].replace(/^\.\//, '');
  const bundleResponse = await fetch(origin + '/_astro/' + originalFile, { cache: 'no-store' });
  const bundle = await bundleResponse.text();
  console.log('bundle len', bundle.length);
  const keyIdx = bundle.indexOf('hs=[');
  const markerIdx = bundle.indexOf('],ze=', keyIdx);
  console.log('keyIdx', keyIdx, 'markerIdx', markerIdx);
  const arrTextRaw = bundle.slice(keyIdx + 3, markerIdx + 1);
  console.log('arrTextRaw len', arrTextRaw.length);
  console.log('arrTextRaw head', arrTextRaw.slice(0, 200));
  // find 'he' in arrTextRaw
  const i = arrTextRaw.indexOf('he');
  console.log('he idx', i);
  if (i !== -1) console.log('he context:', arrTextRaw.slice(Math.max(0, i - 60), i + 60));
  // check replacements
  const cleaned = arrTextRaw
    .replace(/\.\.\.[A-Za-z_$][\w$]*,?/g, '')
    .replace(/\breleasedThemes:de\b/g, 'releasedThemes:' + JSON.stringify(['Basic', 'Gold', 'CheatMaster', 'LootHacker', 'BountyHunter', 'TrickOrTreat', 'Quack']))
    .replace(/\bthemes:de\b/g, 'themes:' + JSON.stringify(['Basic', 'Gold', 'CheatMaster', 'LootHacker', 'BountyHunter', 'TrickOrTreat', 'Quack']))
    .replace(/\breleasedThemes:z\b/g, 'releasedThemes:' + JSON.stringify(['Basic', 'Gold', 'CheatMaster', 'LootHacker', 'BountyHunter', 'TrickOrTreat']))
    .replace(/\breleasedThemes:ie\b/g, 'releasedThemes:' + JSON.stringify(['Basic', 'Fortune', 'Cursed']))
    .replace(/\bthemes:Da\b/g, 'themes:' + JSON.stringify(['Basic', 'Fortune', 'Cursed']))
    .replace(/\breleasedThemes:cs\b/g, 'releasedThemes:' + JSON.stringify(['Basic', 'Fortune']));
  console.log('cleaned head', cleaned.slice(0, 300));
  try {
    const entries = new Function('return ' + cleaned)();
    console.log('parsed entries', entries.length);
  } catch (e) {
    console.error('parse error', e.message);
  }
})();
