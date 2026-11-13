const fs = require('fs');
const {execSync} = require('child_process');

(async () => {
  const origin = 'https://spritechecklist.org';
  const response = await fetch(origin + '/', { cache: 'no-store' });
  const html = await response.text();
  const wrapperMatch = html.match(/\/_astro\/Tracker\.[A-Za-z0-9_-]+\.js/);
  const wrapperResponse = await fetch(origin + wrapperMatch[0], { cache: 'no-store' });
  const wrapperText = await wrapperResponse.text();
  const originalMatch = wrapperText.match(/\.\/Tracker\.[A-Za-z0-9_-]+\.js/) || wrapperText.match(/Tracker\.[A-Za-z0-9_-]+\.js/);
  const originalFile = originalMatch[0].replace(/^\.\//, '');
  const bundleResponse = await fetch(origin + '/_astro/' + originalFile, { cache: 'no-store' });
  const bundle = await bundleResponse.text();

  const keyIdx = bundle.indexOf('ls=[');
  const markerIdx = bundle.indexOf('],Ue=', keyIdx);
  const arrTextRaw = bundle.slice(keyIdx + 3, markerIdx + 1);
  const overrideThemes = ['Basic', 'Gold', 'CheatMaster', 'LootHacker', 'BountyHunter', 'TrickOrTreat', 'Quack'];
  const cleaned = arrTextRaw
    .replace(/\.\.\.[A-Za-z_$][\w$]*,?/g, '')
    .replace(/\breleasedThemes:de\b/g, 'releasedThemes:' + JSON.stringify(overrideThemes))
    .replace(/\bthemes:de\b/g, 'themes:' + JSON.stringify(overrideThemes))
    .replace(/\breleasedThemes:z\b/g, 'releasedThemes:' + JSON.stringify(['Basic', 'Gold', 'CheatMaster', 'LootHacker', 'BountyHunter', 'TrickOrTreat']));
  const entries = new Function('return ' + cleaned)();
  console.log('ls entry count:', entries.length);
  console.log('ls ids:', entries.map(e=>e.id).join(', '));
})();
