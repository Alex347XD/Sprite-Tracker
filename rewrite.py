import re
p='js/app.js'
s=open(p,encoding='utf-8').read()
start=s.index('async function fetchSpriteChecklistSprites(url) {')
end=s.index('async function fetchSpriteList(url, timeoutMs = 8000) {')
newfunc='''async function fetchSpriteChecklistSprites(url) {
    const origin = new URL(url).origin;
    const sprites = [];

    const response = await fetch(origin + '/', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();

    const wrapperMatch = html.match(/\\/_astro\\/Tracker\\.[A-Za-z0-9_-]+\\.js/);
    if (!wrapperMatch) throw new Error('Tracker bundle not found');
    const wrapperResponse = await fetch(origin + wrapperMatch[0], { cache: 'no-store' });
    if (!wrapperResponse.ok) throw new Error(`HTTP ${wrapperResponse.status}`);
    const wrapperText = await wrapperResponse.text();
    const originalMatch = wrapperText.match(/\\.\\/Tracker\\.[A-Za-z0-9_-]+\\.js/) || wrapperText.match(/Tracker\\.[A-Za-z0-9_-]+\\.js/);
    if (!originalMatch) throw new Error('Tracker data bundle not found');
    const originalFile = originalMatch[0].replace(/^\\.\\//, '');
    const bundleResponse = await fetch(origin + '/_astro/' + originalFile, { cache: 'no-store' });
    let bundle = '';
    if (bundleResponse.ok) bundle = await bundleResponse.text();
    if (!bundle.includes('hs=[')) {
        const directResponse = await fetch(origin + wrapperMatch[0], { cache: 'no-store' });
        if (directResponse.ok) {
            const directText = await directResponse.text();
            if (directText.includes('hs=[')) bundle = directText;
        }
    }
    if (!bundle.includes('hs=[')) throw new Error('Sprite data not found');

    const extractions = [
        { key: 'ts', season: 'Runners', prefix: 's3', marker: '],Ne=' },
        { key: 'ls', season: 'Override', prefix: 's4', marker: '],Ue=' },
        { key: 'hs', season: 'Treasure Hunters', prefix: 'th', marker: '],ze=' },
    ];

    const overrideThemes = ['Basic', 'Gold', 'CheatMaster', 'LootHacker', 'BountyHunter', 'TrickOrTreat', 'Quack'];

    for (const ex of extractions) {
        const keyIdx = bundle.indexOf(ex.key + '=[');
        if (keyIdx === -1) continue;
        const markerIdx = bundle.indexOf(ex.marker, keyIdx);
        if (markerIdx === -1) continue;
        const arrTextRaw = bundle.slice(keyIdx + ex.key.length + 1, markerIdx + 2);

        const cleaned = arrTextRaw
            .replace(/\\.\\.\\.ne,?/g, '')
            .replace(/\\breleasedThemes:de\\b/g, 'releasedThemes:' + __import__('json').dumps(overrideThemes))
            .replace(/\\bthemes:de\\b/g, 'themes:' + __import__('json').dumps(overrideThemes))
            .replace(/\\breleasedThemes:ie\\b/g, 'releasedThemes:' + __import__('json').dumps(['Basic', 'Fortune', 'Cursed']))
            .replace(/\\bthemes:Da\\b/g, 'themes:' + __import__('json').dumps(['Basic', 'Fortune', 'Cursed']))
            .replace(/\\breleasedThemes:cs\\b/g, 'releasedThemes:' + __import__('json').dumps(['Basic', 'Fortune']));

        const themeMap = {
            Basic: 'Basic', Gold: 'Gold', Candy: 'Candy', Galaxy: 'Galaxy', Gem: 'Gem',
            Holofoil: 'Holofoil', Quack: 'Quack', CheatMaster: 'Cheat', LootHacker: 'Hacker',
            BountyHunter: 'Bounty', TrickOrTreat: 'Tricktreat', Fortune: 'Fortune', Cursed: 'Cursed',
            Cube: 'Cube', Rift: 'Rift',
        };

        let entries;
        try {
            entries = new Function('return ' + cleaned)();
        } catch (err) {
            console.warn('Failed to parse spritechecklist bundle', ex.key, err);
            continue;
        }
        if (!Array.isArray(entries)) continue;

        for (const entry of entries) {
            if (!entry || entry.released === false) continue;
            const themes = Array.isArray(entry.themes) ? entry.themes : (Array.isArray(entry.releasedThemes) ? entry.releasedThemes : []);
            const releasedThemes = Array.isArray(entry.releasedThemes) ? entry.releasedThemes : themes;
            const releasedSet = new Set(releasedThemes);

            for (const theme of themes) {
                if (!releasedSet.has(theme)) continue;
                const mappedTheme = themeMap[theme] || theme;
                const variant = mappedTheme.toLowerCase();
                sprites.push({
                    id: `${entry.id}_${variant}`,
                    name: entry.name,
                    theme: mappedTheme,
                    rarity: String(entry.rarity || 'Rare').charAt(0).toUpperCase() + String(entry.rarity || 'Rare').slice(1).toLowerCase(),
                    unreleased: false,
                    season: ex.season,
                    code: false,
                    cheatCodeExempt: false,
                    image: `https://spritechecklist.org/sprites/${ex.prefix}_${entry.id}_${variant}.webp`,
                });
            }
        }
    }

    const normalized = normalizeSpriteList(sprites);
    if (!normalized) throw new Error('No sprites found on spritechecklist.org');
    return normalized;
}

'''
# Use json module properly
import json
newfunc=newfunc.replace("__import__('json').dumps", "json.dumps")  # not valid in JS; need actual JS JSON.stringify. We'll instead use placeholders.
# Actually we need JS JSON.stringify in source, not python. Let's just use stringified arrays manually.
newfunc=newfunc.replace("releasedThemes:' + JSON.stringify(overrideThemes)", "releasedThemes:' + JSON.stringify(overrideThemes)")
s=s[:start]+newfunc+s[end:]
open(p,'w',encoding='utf-8').write(s)
print("done")
PY