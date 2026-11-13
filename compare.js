const fs = require('fs');

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

  const extractions = [
    { key: 'ts', season: 'Runners', prefix: '', marker: '],Ne=' },
    { key: 'ls', season: 'Override', prefix: 's4', marker: '],Ue=' },
    { key: 'hs', season: 'Treasure Hunters', prefix: 'th', marker: '],ze=' },
  ];
  const overrideThemes = ['Basic', 'Gold', 'CheatMaster', 'LootHacker', 'BountyHunter', 'TrickOrTreat', 'Quack'];
  const idMap = {halfpeeld:'halfpeel',lilsquibbly:'squibbly',transpondersnail:'snail',liluzivertjr:'uzi',lilflacko:'flacko',stormscout:'stormking',dumpsterdive:'dumpster',spookydash:'dash',onewishwillow:'willow',vinijr:'vini'};
  const themeMap = {Basic:'Basic',Gold:'Gold',Candy:'Candy',Galaxy:'Galaxy',Gem:'Gem',Holofoil:'Holofoil',Quack:'Quack',CheatMaster:'Cheat',LootHacker:'Hacker',BountyHunter:'Bounty',TrickOrTreat:'Tricktreat',Fortune:'Fortune',Cursed:'Cursed',Cube:'Cube',Rift:'Rift'};
  const idSuffixMap = {Basic:'basic',Gold:'gold',Candy:'candy',Galaxy:'galaxy',Gem:'gem',Holofoil:'holofoil',Cube:'cube',Rift:'rift',Quack:'quack',Cheat:'cheat',Hacker:'hacker',Bounty:'bounty',Reaper:'reaper',Tricktreat:'treat',Fortune:'fortune',Cursed:'cursed'};
  const newIds = new Set();
  for (const ex of extractions) {
    const keyIdx = bundle.indexOf(ex.key + '=[');
    const markerIdx = bundle.indexOf(ex.marker, keyIdx);
    const arrTextRaw = bundle.slice(keyIdx + ex.key.length + 1, markerIdx + 1);
    const cleaned = arrTextRaw
      .replace(/\.\.\.[A-Za-z_$][\w$]*,?/g, '')
      .replace(/\breleasedThemes:de\b/g, 'releasedThemes:' + JSON.stringify(overrideThemes))
      .replace(/\bthemes:de\b/g, 'themes:' + JSON.stringify(overrideThemes))
      .replace(/\breleasedThemes:z\b/g, 'releasedThemes:' + JSON.stringify(['Basic', 'Gold', 'CheatMaster', 'LootHacker', 'BountyHunter', 'TrickOrTreat']))
      .replace(/\breleasedThemes:ie\b/g, 'releasedThemes:' + JSON.stringify(['Basic', 'Fortune', 'Cursed']))
      .replace(/\bthemes:Da\b/g, 'themes:' + JSON.stringify(['Basic', 'Fortune', 'Cursed']))
      .replace(/\breleasedThemes:cs\b/g, 'releasedThemes:' + JSON.stringify(['Basic', 'Fortune']));
    let entries;
    try { entries = new Function('return ' + cleaned)(); } catch(e) { console.error(ex.key, e.message); continue; }
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      if (!entry || entry.released === false) continue;
      const themes = Array.isArray(entry.themes) ? entry.themes : (Array.isArray(entry.releasedThemes) ? entry.releasedThemes : []);
      const releasedThemes = Array.isArray(entry.releasedThemes) ? entry.releasedThemes : themes;
      const releasedSet = new Set(releasedThemes);
      for (const theme of themes) {
        if (!releasedSet.has(theme)) continue;
        const mappedTheme = themeMap[theme] || theme;
        const mappedId = idMap[entry.id] || entry.id;
        const idSuffix = idSuffixMap[mappedTheme] || mappedTheme.toLowerCase();
        newIds.add(mappedId + '_' + idSuffix);
      }
    }
  }

  const backup = JSON.parse(fs.readFileSync('C:/Users/zacha/Downloads/fnsprites-backup.json','utf8'));
  const allBackupIds = [...new Set([...backup.obtained, ...backup.mastered])];
  const missing = allBackupIds.filter(id => !newIds.has(id));
  console.log('new count:', newIds.size);
  console.log('backup unique ids:', allBackupIds.length);
  console.log('missing count:', missing.length);
  console.log('missing:', missing);
})();
