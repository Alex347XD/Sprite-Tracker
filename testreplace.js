const overrideThemes = ['Basic', 'Gold', 'CheatMaster', 'LootHacker', 'BountyHunter', 'TrickOrTreat', 'Quack'];
const sample = '{id:"bush",name:"Bush",rarity:"Rare",released:!0,releasedThemes:de,themes:de,ability:"..."}';
const cleaned = sample
  .replace(/\.\.\.ne,?/g, '')
  .replace(/\breleasedThemes:de\b/g, 'releasedThemes:' + JSON.stringify(overrideThemes))
  .replace(/\bthemes:de\b/g, 'themes:' + JSON.stringify(overrideThemes));
console.log(cleaned);
try { const e = new Function('return [' + cleaned + ']')(); console.log('parsed', e.length); } catch(err){ console.error('parse err', err.message); }
