/* ===================================================
   Constants
   =================================================== */

const KEYS = {
    obtained: 'fn_obtained_sprites',
    mastered: 'fn_mastered_sprites',
    search: 'fn_state_search',
    themes: 'fn_state_themes',
    status: 'fn_state_status_filter',
    hideMastered: 'fn_state_hide_mastered',
    sortOrder: 'fn_state_sort_order',
    showUnreleased: 'fn_state_unreleased',
    lowFidelity: 'fn_state_low_fidelity',
    openExports: 'fn_state_open_exports',
    season: 'fn_state_season',
};

const REDEEMED_KEY = 'fn_redeemed_codes';
const SPRITE_LIST_URL_KEY = 'fn_sprite_list_url';
const SPRITE_LIST_AUTO_KEY = 'fn_sprite_list_auto';
const SPRITE_LIST_CACHE_KEY = 'fn_sprite_list_cache';
const SPRITE_LIST_UPDATED_KEY = 'fn_sprite_list_updated';
const SPRITE_LIST_API_KEY_KEY = 'fn_sprite_list_api_key';
let spriteListInitialized = false;

const THEME_ORDER = ['Basic', 'Gold', 'Candy', 'Galaxy', 'Gem', 'Holofoil', 'Cube', 'Rift', 'Quack', 'Cheat', 'Hacker', 'Bounty', 'Reaper', 'Tricktreat', 'Fortune', 'Cursed'];
const RARITY_ORDER = ['Rare', 'Epic', 'Legendary', 'Mythic'];
const STATUS_FILTERS = ['all', 'owned', 'missing'];
const SORT_METHODS = ['theme', 'sprite', 'name', 'rarity'];
const UI_THEME_LABELS = { Candy: 'Gummy', Cheat: 'Cheat Master', Hacker: 'Loot Hacker', Bounty: 'Bounty Hunter', Reaper: 'Reaper', Tricktreat: 'Trick or Treat' };
const EXPORT_THEME_LABELS = { Basic: 'NORMAL', Candy: 'GUMMY', Hacker: 'LOOT HACKER', Bounty: 'BOUNTY HUNTER', Reaper: 'REAPER', Tricktreat: 'TRICK OR TREAT' };
const TRADE_THEME_LABELS = { Basic: 'Base', Candy: 'Gummy', Hacker: 'Loot Hacker', Bounty: 'Bounty Hunter', Reaper: 'Reaper', Tricktreat: 'Trick or Treat' };
const TRACKER_URL = 'https://rickventure.com';
const CROWN_ICON = '<svg class="crown-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M2 19h20v2H2v-2zM2 5l5 3.5L12 2l5 6.5L22 5v12H2V5z"/></svg>';

const EXPORT_LAYOUT = {
    border: 4,
    sidePad: 8,
    minCanvasW: 240,
    headerH: 64,
    colHeaderH: 25,
    cardW: 110,
    cardH: 138,
    rowGap: 6,
    cardGap: 6,
    labelW: 90,
    colGap: 16,
    footerH: 32,
    maxSingleColumnRows: 6,
};

/* ===================================================
   State
   =================================================== */

const state = {
    obtained: [],
    mastered: [],
    viewMode: false,
    filters: { search: '', themes: [], season: 'Treasure Hunters', status: 'all' },
    settings: {
        hideMastered: false,
        sortOrder: 'theme',
        showUnreleased: false,
        lowFidelity: false,
        openExports: false,
    },
};

/* ===================================================
   DOM References
   =================================================== */

const dom = {
    viewBanner: document.getElementById('viewBanner'),
    grid: document.getElementById('spriteGrid'),
    searchInput: document.getElementById('searchInput'),
    themeDropdown: document.getElementById('themeDropdown'),
    themeToggle: document.getElementById('themeToggle'),
    themeMenu: document.getElementById('themeMenu'),
    themeCheckboxList: document.getElementById('themeCheckboxList'),
    themeSelectAllBtn: document.getElementById('themeSelectAllBtn'),
    themeClearBtn: document.getElementById('themeClearBtn'),
    sortOrder: document.getElementById('sortOrder'),
    statusDropdown: document.getElementById('statusDropdown'),
    statusToggle: document.getElementById('statusToggle'),
    statusMenu: document.getElementById('statusMenu'),
    hideMastered: document.getElementById('hideMastered'),
    showUnreleased: document.getElementById('showUnreleased'),
    lowFidelity: document.getElementById('lowFidelity'),
    seasonFilter: document.getElementById('seasonFilter'),
    openExports: document.getElementById('openExports'),
    exportModeSwitch: document.getElementById('exportModeSwitch'),
    exportDropdown: document.getElementById('exportDropdown'),
    exportToggle: document.getElementById('exportToggle'),
    copyDropdown: document.getElementById('copyDropdown'),
    copyToggle: document.getElementById('copyToggle'),
    copyTradeTextBtn: document.getElementById('copyTradeTextBtn'),
    copyTradeGridBtn: document.getElementById('copyTradeGridBtn'),
    collectionRatio: document.getElementById('collectionRatio'),
    collectionFill: document.getElementById('collectionFill'),
    masteryRatio: document.getElementById('masteryRatio'),
    masteryFill: document.getElementById('masteryFill'),
    settingsDropdown: document.getElementById('settingsDropdown'),
    settingsToggle: document.getElementById('settingsToggle'),
    settingsExportBackupBtn: document.getElementById('settingsExportBackupBtn'),
    settingsImportBtn: document.getElementById('settingsImportBtn'),
    importInput: document.getElementById('importInput'),
    spriteListUrl: document.getElementById('spriteListUrl'),
    spriteListAuto: document.getElementById('spriteListAuto'),
    spriteListUpdateBtn: document.getElementById('spriteListUpdateBtn'),
    spriteListStatus: document.getElementById('spriteListStatus'),
    spriteListImportInput: document.getElementById('spriteListImportInput'),
    spriteListImportBtn: document.getElementById('spriteListImportBtn'),
};

/* ===================================================
   Persistence
   =================================================== */

function persist(key, value) {
    try {
        localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    } catch (err) {
        console.warn('Unable to save tracker state.', err);
    }
}

function readStoredArray(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

function uniqueValidIds(ids, validIds = getSpriteIdSet()) {
    return [...new Set(ids)].filter(id => validIds.has(id));
}

function saveCollection() {
    persist(KEYS.obtained, state.obtained);
    persist(KEYS.mastered, state.mastered);
}

function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function load() {
    const validIds = getSpriteIdSet();
    state.obtained = uniqueValidIds(readStoredArray(KEYS.obtained), validIds);
    state.mastered = uniqueValidIds(readStoredArray(KEYS.mastered), validIds)
        .filter(id => state.obtained.includes(id));
    state.filters.search = localStorage.getItem(KEYS.search) || '';
    state.filters.themes = readStoredArray(KEYS.themes);
    state.filters.season = localStorage.getItem(KEYS.season) || 'Treasure Hunters';

    let savedStatus = localStorage.getItem(KEYS.status) || 'all';
    if (savedStatus === 'obtained') savedStatus = 'owned';
    state.filters.status = STATUS_FILTERS.includes(savedStatus) ? savedStatus : 'all';

	state.settings.hideMastered = localStorage.getItem(KEYS.hideMastered) === 'true';
    
    let savedSort = localStorage.getItem(KEYS.sortOrder);
    if (!savedSort) {
        const legacyGroup = localStorage.getItem('fn_state_group_theme');
        savedSort = legacyGroup === 'false' ? 'sprite' : 'theme';
    }
    state.settings.sortOrder = SORT_METHODS.includes(savedSort) ? savedSort : 'theme';

    state.settings.showUnreleased = localStorage.getItem(KEYS.showUnreleased) === 'true';
    state.settings.lowFidelity = localStorage.getItem(KEYS.lowFidelity) === 'true';
    const storedOpenExports = localStorage.getItem(KEYS.openExports);
    state.settings.openExports = storedOpenExports !== null ? storedOpenExports === 'true' : true;
}

function applyStateToDOM() {
    dom.searchInput.value = state.filters.search;
    dom.seasonFilter.value = state.filters.season;
    dom.sortOrder.value = state.settings.sortOrder;
    dom.hideMastered.checked = state.settings.hideMastered;
    dom.showUnreleased.checked = state.settings.showUnreleased;
    dom.lowFidelity.checked = state.settings.lowFidelity;
    document.body.classList.toggle('low-fidelity', state.settings.lowFidelity);
   
    if (isIOS()) {
        if (dom.exportModeSwitch) dom.exportModeSwitch.hidden = true;
    } else {
        dom.openExports.checked = !state.settings.openExports;
        const switchLabel = dom.exportModeSwitch.querySelector('span');
        if (switchLabel) {
            switchLabel.textContent = dom.openExports.checked ? 'Download Exports' : 'Open Exports';
        }
    }

    const statusLabels = { all: 'All', owned: 'Owned', missing: 'Missing' };
    dom.statusToggle.textContent = `Show: ${statusLabels[state.filters.status] || 'All'}`;
    dom.statusMenu.querySelectorAll('[data-status]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.status === state.filters.status);
    });
}

function checkUnredeemedCodes() {
    const notifDot = document.getElementById('codesNotification');
    const codesBtn = document.getElementById('codesBtn');
    if (typeof baseCodes === 'undefined') return;

    let showAlerts = true;
    try {
        const storedSetting = localStorage.getItem('fn_alert_new_codes');
        if (storedSetting !== null) {
            showAlerts = JSON.parse(storedSetting);
        }
    } catch {
        showAlerts = true;
    }

    if (!showAlerts) {
        if (notifDot) notifDot.hidden = true;
        if (codesBtn) codesBtn.classList.remove('btn-hack-active');
        return;
    }

    let redeemed = [];
    try {
        redeemed = JSON.parse(localStorage.getItem(REDEEMED_KEY)) || [];
    } catch {
        redeemed = [];
    }

    const hasUnredeemed = baseCodes.some(c => c.active && !redeemed.includes(c.code));
    if (notifDot) notifDot.hidden = !hasUnredeemed;

    const hasUncollectedReward = baseCodes.some(c => 
        c.active && 
        !redeemed.includes(c.code) && 
        c.internalreward && 
        !isObtained(c.internalreward)
    );

    if (codesBtn) {
        codesBtn.classList.toggle('btn-hack-active', hasUncollectedReward);
    }
}

/* ===================================================
   Sprite List Source
   =================================================== */

function normalizeSpriteList(data) {
    let list = data;
    if (!Array.isArray(list)) {
        if (data && Array.isArray(data.sprites)) list = data.sprites;
        else if (data && Array.isArray(data.data)) list = data.data;
        else if (data && Array.isArray(data.items)) list = data.items;
        else if (data && Array.isArray(data.results)) list = data.results;
        else return null;
    }

    const sprites = [];
    const seen = new Set();
    for (const item of list) {
        if (!item || typeof item !== 'object') continue;
        const id = String(item.id || '').trim();
        const name = String(item.name || '').trim();
        const theme = String(item.theme || '').trim();
        const rarity = String(item.rarity || '').trim();
        if (!id || !name || !theme || !rarity) continue;
        if (seen.has(id)) continue;
        seen.add(id);
        sprites.push({
            id,
            name,
            theme,
            rarity,
            unreleased: item.unreleased === true,
            season: typeof item.season === 'string' && item.season.trim() ? item.season.trim() : 'Unknown',
            code: item.code === true,
            codeLocked: typeof item.codeLocked === 'boolean' ? item.codeLocked : undefined,
            cheatCodeExempt: item.cheatCodeExempt === true,
        });
    }
    return sprites.length ? sprites : null;
}

function readCachedSpriteList() {
    try {
        const raw = localStorage.getItem(SPRITE_LIST_CACHE_KEY);
        if (!raw) return null;
        return normalizeSpriteList(JSON.parse(raw));
    } catch {
        return null;
    }
}

function cacheSpriteList(sprites) {
    try {
        localStorage.setItem(SPRITE_LIST_CACHE_KEY, JSON.stringify(sprites));
        localStorage.setItem(SPRITE_LIST_UPDATED_KEY, String(Date.now()));
    } catch (err) {
        console.warn('Unable to cache sprite list.', err);
    }
}

function getSpriteListSourceUrl() {
    return 'https://spritechecklist.org';
}

function setSpriteListSourceUrl(url) {
    const clean = String(url || '').trim();
    if (clean) localStorage.setItem(SPRITE_LIST_URL_KEY, clean);
    else localStorage.removeItem(SPRITE_LIST_URL_KEY);
}

function getSpriteListAutoUpdate() {
    return localStorage.getItem(SPRITE_LIST_AUTO_KEY) !== 'false';
}

function setSpriteListAutoUpdate(value) {
    localStorage.setItem(SPRITE_LIST_AUTO_KEY, value ? 'true' : 'false');
}

function setSpriteListStatus(message) {
    if (dom.spriteListStatus) dom.spriteListStatus.textContent = message;
}

function syncSpriteListSettingsUI() {
    if (dom.spriteListUrl) dom.spriteListUrl.value = getSpriteListSourceUrl();
    if (dom.spriteListAuto) dom.spriteListAuto.checked = getSpriteListAutoUpdate();
}

function spriteChecklistVariantToTheme(variant) {
    const map = {
        basic: 'Basic',
        fortune: 'Fortune',
        cursed: 'Cursed',
        jeweled: 'Gem',
        gem: 'Gem',
    };
    const key = String(variant || '').toLowerCase();
    return map[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

async function fetchSpriteChecklistSprites(url) {
    const origin = new URL(url).origin;
    const pages = url.includes('/season-4')
        ? [{ path: '/season-4', season: 'Override' }]
        : url.includes('/season-3')
            ? [{ path: '/season-3', season: 'Runners' }]
            : [
                { path: '', season: null },
                { path: '/season-4', season: 'Override' },
                { path: '/season-3', season: 'Runners' },
            ];

    const sprites = [];
    for (const page of pages) {
        const response = await fetch(origin + page.path, { cache: 'no-store' });
        if (!response.ok) continue;
        const html = await response.text();

        let season = page.season;
        if (!season) {
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            const title = titleMatch ? titleMatch[1] : '';
            if (/Override/i.test(title)) season = 'Override';
            else if (/Runners/i.test(title)) season = 'Runners';
            else season = 'Treasure Hunters';
        }

        const wrapperMatch = html.match(/\/_astro\/Tracker\.[A-Za-z0-9_-]+\.js/);
        if (!wrapperMatch) continue;
        const wrapperResponse = await fetch(origin + wrapperMatch[0], { cache: 'no-store' });
        if (!wrapperResponse.ok) continue;
        const wrapperText = await wrapperResponse.text();
        const originalMatch = wrapperText.match(/\.\/Tracker\.[A-Za-z0-9_-]+\.js/) || wrapperText.match(/\/_astro\/Tracker\.[A-Za-z0-9_-]+\.js/);
        if (!originalMatch) continue;
        const originalFile = originalMatch[0].replace(/^\.\//, '');
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
        if (!bundle.includes('hs=[')) continue;

        const hsIdx = bundle.indexOf('hs=[');
        if (hsIdx === -1) continue;
        const seasonIdx = bundle.indexOf('seasonId', hsIdx);
        const endIdx = seasonIdx === -1 ? bundle.indexOf('}]', hsIdx) : bundle.lastIndexOf('}]', seasonIdx);
        if (endIdx === -1) continue;
        const arrText = bundle.slice(hsIdx + 3, endIdx + 2);

        const ieMatch = bundle.match(/ie=(\\[[^\\]]*\\])/);
        const csMatch = bundle.match(/cs=(\\[[^\\]]*\\])/);
        const ie = ieMatch ? JSON.parse(ieMatch[1]) : ['Basic', 'Fortune', 'Cursed'];
        const cs = csMatch ? JSON.parse(csMatch[1]) : ['Basic', 'Fortune'];

        let entries;
        try {
            entries = new Function('const ie = ' + JSON.stringify(ie) + '; const cs = ' + JSON.stringify(cs) + '; return ' + arrText)();
        } catch (err) {
            console.warn('Failed to parse spritechecklist bundle', err);
            continue;
        }
        if (!Array.isArray(entries)) continue;

        for (const entry of entries) {
            if (!entry || !entry.released) continue;
            const themes = Array.isArray(entry.themes) ? entry.themes : ['Basic', 'Fortune', 'Cursed'];
            const releasedThemes = Array.isArray(entry.releasedThemes)
                ? entry.releasedThemes
                : (entry.released ? cs : []);
            const releasedSet = new Set(releasedThemes);

            for (const theme of themes) {
                if (!releasedSet.has(theme)) continue;
                const variant = theme.toLowerCase();
                sprites.push({
                    id: `${entry.id}_${variant}`,
                    name: entry.name,
                    theme: theme.charAt(0).toUpperCase() + theme.slice(1).toLowerCase(),
                    rarity: String(entry.rarity || 'Rare').charAt(0).toUpperCase() + String(entry.rarity || 'Rare').slice(1).toLowerCase(),
                    unreleased: false,
                    season,
                    code: false,
                    cheatCodeExempt: false,
                });
            }
        }
    }

    const normalized = normalizeSpriteList(sprites);
    if (!normalized) throw new Error('No sprites found on spritechecklist.org');
    return normalized;
}

async function fetchSpriteList(url, timeoutMs = 8000) {
    if (!url) throw new Error('No sprite list URL configured.');

    let parsed;
    try { parsed = new URL(url); } catch { throw new Error('Invalid URL'); }

    if (parsed.hostname.includes('spritechecklist.org')) {
        return fetchSpriteChecklistSprites(url);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const sprites = normalizeSpriteList(data);
        if (!sprites) throw new Error('Invalid sprite list format');
        return sprites;
    } finally {
        clearTimeout(timer);
    }
}

function applySpriteList(sprites, options = {}) {
    if (!Array.isArray(sprites) || !sprites.length) return false;
    baseSprites = sprites;

    const validIds = getSpriteIdSet();
    if (spriteListInitialized) {
        state.obtained = uniqueValidIds(state.obtained, validIds);
        state.mastered = uniqueValidIds(state.mastered, validIds)
            .filter(id => state.obtained.includes(id));
        saveCollection();
        populateThemeFilter();
        applyStateToDOM();
        renderGrid();
        checkUnredeemedCodes();
    }

    if (!options.silent) {
        toast(`Sprite list updated (${sprites.length} sprites).`, 'success');
    }
    return true;
}

async function updateSpriteListFromSource(options = {}) {
    const url = options.url || getSpriteListSourceUrl();
    if (url) setSpriteListSourceUrl(url);
    const targetUrl = getSpriteListSourceUrl();
    if (!targetUrl) {
        setSpriteListStatus('No sprite list URL configured.');
        if (!options.silent) toast('Enter a sprite list URL first.', 'error');
        return false;
    }

    setSpriteListStatus('Updating sprite list...');
    try {
        const sprites = await fetchSpriteList(targetUrl);
        cacheSpriteList(sprites);
        const applied = applySpriteList(sprites, { silent: options.silent });
        if (applied) {
            const updated = localStorage.getItem(SPRITE_LIST_UPDATED_KEY);
            setSpriteListStatus(`Updated ${updated ? new Date(Number(updated)).toLocaleString() : 'just now'} (${sprites.length} sprites).`);
        }
        return applied;
    } catch (err) {
        const cached = readCachedSpriteList();
        if (cached) {
            applySpriteList(cached, { silent: true });
            setSpriteListStatus(`Update failed (${err.message}); using cached list.`);
        } else {
            setSpriteListStatus(`Update failed: ${err.message}`);
        }
        if (!options.silent) toast(`Sprite list update failed: ${err.message}`, 'error');
        return false;
    }
}

async function prepareSpriteList() {
    const cached = readCachedSpriteList();
    if (cached) {
        applySpriteList(cached, { silent: true });
    }

    if (getSpriteListAutoUpdate()) {
        const url = getSpriteListSourceUrl();
        if (url) {
            try {
                const sprites = await fetchSpriteList(url);
                cacheSpriteList(sprites);
                applySpriteList(sprites, { silent: true });
                setSpriteListStatus(`Updated ${new Date().toLocaleString()} (${sprites.length} sprites).`);
            } catch (err) {
                if (cached) setSpriteListStatus(`Using cached list (${err.message}).`);
                else setSpriteListStatus(`Built-in list in use (${err.message}).`);
            }
        } else {
            setSpriteListStatus('Using built-in sprite list.');
        }
    } else {
        setSpriteListStatus(cached ? 'Using cached sprite list.' : 'Using built-in sprite list.');
    }
}

/* ===================================================
   Share Encoding / Decoding
   =================================================== */

const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function encodeBits(bits) {
    while (bits.length % 6 !== 0) {
        bits += '0';
    }
    let code = '';
    for (let i = 0; i < bits.length; i += 6) {
        const val = parseInt(bits.substring(i, i + 6), 2);
        code += B64_CHARS[val];
    }
    return code.replace(/A+$/, '');
}

function decodeBits(code) {
    if (!code) return '';
    let bits = '';
    for (let i = 0; i < code.length; i++) {
        const val = B64_CHARS.indexOf(code[i]);
        if (val === -1) return '';
        bits += val.toString(2).padStart(6, '0');
    }
    return bits;
}

function compressCollection(sprites, obtained, mastered) {
    let obtainedBits = '';
    let masteredBits = '';
    
    sprites.forEach(s => {
        obtainedBits += obtained.includes(s.id) ? '1' : '0';
        masteredBits += mastered.includes(s.id) ? '1' : '0';
    });

    const obtainedCode = encodeBits(obtainedBits);
    const masteredCode = encodeBits(masteredBits);

    if (!masteredCode) {
        return obtainedCode;
    }
    return `${obtainedCode}~${masteredCode}`;
}

function decompressCollection(sprites, code) {
    if (!code) return { obtained: [], mastered: [] };
    
    const parts = code.split('~');
    if (parts.length > 2) {
        return { obtained: [], mastered: [] };
    }

    const obtainedCode = parts[0];
    const masteredCode = parts[1] || '';

    if (!/^[A-Za-z0-9\-_]*$/.test(obtainedCode) || !/^[A-Za-z0-9\-_]*$/.test(masteredCode)) {
        return { obtained: [], mastered: [] };
    }

    try {
        const obtainedBits = decodeBits(obtainedCode);
        const masteredBits = decodeBits(masteredCode);

        const obtained = [];
        const mastered = [];

        sprites.forEach((s, idx) => {
            const isObtained = obtainedBits[idx] === '1';
            const isMastered = masteredBits[idx] === '1';

            if (isObtained) {
                obtained.push(s.id);
                if (isMastered) {
                    mastered.push(s.id);
                }
            }
        });

        return { obtained, mastered };
    } catch {
        return { obtained: [], mastered: [] };
    }
}

/* ===================================================
   Toast Notifications
   =================================================== */

function toast(message, type = 'info') {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = message;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('visible'));
    setTimeout(() => {
        el.classList.remove('visible');
        el.addEventListener('transitionend', () => el.remove(), { once: true });
        setTimeout(() => el.remove(), 500);
    }, 2500);
}

/* ===================================================
   Sprite Helpers
   =================================================== */

function getFamilyKey(sprite) {
    return sprite.id.split('_')[0];
}

function getSpriteIdSet(sprites = baseSprites) {
    return new Set(sprites.map(sprite => sprite.id));
}

function getReleasedSprites() {
	return baseSprites.filter(sprite => {
        if (sprite.unreleased) return false;
        
        const spriteSeason = sprite.season || 'Unknown';
        if (state.filters.season !== 'all' && spriteSeason !== state.filters.season) {
            return false;
        }
        
        return true;
    });
}

// Cheat Master sprites are normally locked behind a lobby hack code. Flag a
// sprite with `cheatCodeExempt: true` in sprites-data.js (see "crown_cheat")
// to treat it like a regular sprite instead - no code required, no Hack
// Available/Unavailable badge, ever.
function isCodeLocked(sprite) {
    if (!sprite.codeLocked || sprite.cheatCodeExempt || isObtained(sprite.id)) return false;
    if (typeof baseCodes === 'undefined') return true;
    return !baseCodes.some(c => c.active && c.internalreward === sprite.id);
}

// Same as getReleasedSprites(), but also excludes locked/unavailable Cheat Master
// sprites (no active code yet) — they're treated like unreleased sprites in exports.
function getExportableSprites() {
    return getReleasedSprites().filter(sprite => !isCodeLocked(sprite));
}



function getFamilyKeys(sprites = getReleasedSprites()) {
    return sprites.reduce((keys, sprite) => {
        const key = getFamilyKey(sprite);
        if (!keys.includes(key)) keys.push(key);
        return keys;
    }, []);
}

function getActiveThemes(sprites = getReleasedSprites()) {
    return sprites
        .reduce((themes, sprite) => {
            if (!themes.includes(sprite.theme)) themes.push(sprite.theme);
            return themes;
        }, [])
        .sort((a, b) => getOrderedIndex(THEME_ORDER, a) - getOrderedIndex(THEME_ORDER, b));
}

function getOrderedIndex(order, value) {
    const index = order.indexOf(value);
    return index === -1 ? Infinity : index;
}

function getCharName(charKey) {
    const basicSprite = baseSprites.find(sprite => sprite.id === `${charKey}_basic`);
    return basicSprite ? basicSprite.name : charKey.charAt(0).toUpperCase() + charKey.slice(1);
}

function getDisplayName(name) {
    return name === 'Burnt Peanut' ? name : `${name} Sprite`;
}

function getUiThemeLabel(theme) {
    return UI_THEME_LABELS[theme] || theme;
}

function getExportThemeLabel(theme) {
    return EXPORT_THEME_LABELS[theme] || theme.toUpperCase();
}

function getTradeThemeLabel(theme) {
    return TRADE_THEME_LABELS[theme] || theme;
}

function getCollectionCounts(sprites = getExportableSprites()) {
    return {
        total: sprites.length,
        collected: sprites.filter(sprite => isObtained(sprite.id)).length,
        mastered: sprites.filter(sprite => isMastered(sprite.id)).length,
    };
}

function getFamilyThemeMap(sprites) {
    return sprites.reduce((map, sprite) => {
        const familyKey = getFamilyKey(sprite);
        if (!map.has(familyKey)) map.set(familyKey, new Map());
        map.get(familyKey).set(sprite.theme, sprite);
        return map;
    }, new Map());
}

function isObtained(id) {
    return state.obtained.includes(id);
}

function isMastered(id) {
    return state.mastered.includes(id);
}

function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
    }[char]));
}

/* ===================================================
   Progress
   =================================================== */

function updateProgress() {
    const { total, collected, mastered } = getCollectionCounts();

    dom.collectionRatio.textContent = `${collected} / ${total}`;
    dom.collectionFill.style.width = total > 0 ? `${(collected / total) * 100}%` : '0%';
    dom.masteryRatio.textContent = `${mastered} / ${total}`;
    dom.masteryFill.style.width = total > 0 ? `${(mastered / total) * 100}%` : '0%';
}

/* ===================================================
   Filtering & Sorting
   =================================================== */

function filterSprites() {
    const search = state.filters.search.trim().toLowerCase();

    return baseSprites.filter(sprite => {
        if (state.settings.hideMastered && isMastered(sprite.id)) return false;
        if (!state.settings.showUnreleased && sprite.unreleased) return false;
        if (state.viewMode && (!isObtained(sprite.id) || sprite.unreleased)) return false;

        const searchableText = `${getUiThemeLabel(sprite.theme)} ${sprite.name}`.toLowerCase();
        const matchesSearch = !search || searchableText.includes(search);
        const matchesTheme = state.filters.themes.includes(sprite.theme);
        const matchesSeason = state.filters.season === 'all' || (sprite.season || 'Unknown') === state.filters.season;

        let matchesStatus = true;
        if (!state.viewMode) {
            const isOwned = isObtained(sprite.id);
            if (state.filters.status === 'owned') matchesStatus = isOwned;
            if (state.filters.status === 'missing') matchesStatus = !isOwned;
        }

        return matchesSearch && matchesTheme && matchesSeason && matchesStatus;
    });
}

function sortSprites(items, method) {
    const sorted = [...items];
    if (method === 'theme') {
        return sorted.sort((a, b) => {
            const idxA = getOrderedIndex(THEME_ORDER, a.theme);
            const idxB = getOrderedIndex(THEME_ORDER, b.theme);
            if (idxA !== idxB) return idxA - idxB;
            const rarityIdxA = getOrderedIndex(RARITY_ORDER, a.rarity);
            const rarityIdxB = getOrderedIndex(RARITY_ORDER, b.rarity);
            return rarityIdxA - rarityIdxB;
        });
    }
    if (method === 'sprite') {
        return sorted.sort((a, b) => {
            const familyA = getFamilyKey(a);
            const familyB = getFamilyKey(b);
            if (familyA !== familyB) return familyA.localeCompare(familyB);
            return getOrderedIndex(THEME_ORDER, a.theme) - getOrderedIndex(THEME_ORDER, b.theme);
        });
    }
    if (method === 'name') {
        return sorted.sort((a, b) => {
            const baseNameA = getCharName(getFamilyKey(a));
            const baseNameB = getCharName(getFamilyKey(b));
            const cmp = baseNameA.localeCompare(baseNameB);
            if (cmp !== 0) return cmp;
            return getOrderedIndex(THEME_ORDER, a.theme) - getOrderedIndex(THEME_ORDER, b.theme);
        });
    }
    if (method === 'rarity') {
        return sorted.sort((a, b) => {
            const idxA = getOrderedIndex(RARITY_ORDER, a.rarity);
            const idxB = getOrderedIndex(RARITY_ORDER, b.rarity);
            if (idxA !== idxB) return idxA - idxB;
            const themeIdxA = getOrderedIndex(THEME_ORDER, a.theme);
            const themeIdxB = getOrderedIndex(THEME_ORDER, b.theme);
            if (themeIdxA !== themeIdxB) return themeIdxA - themeIdxB;
            return a.name.localeCompare(b.name);
        });
    }
    return sorted;
}

/* ===================================================
   Rendering
   =================================================== */

// Themes that actually exist among released sprites for the currently
// selected season. Sprites with no match here are hidden from the theme
// checkbox list (picking them would do nothing), but any prior selection of
// them is preserved in state.filters.themes so it's restored if the user
// switches back to a season where they're relevant again.
function getSeasonThemes() {
    return getActiveThemes(getReleasedSprites());
}

function populateThemeFilter() {
    // Always start with every current theme selected on load/refresh, so newly
    // added themes are never hidden behind a stale saved selection.
    state.filters.themes = getActiveThemes(baseSprites);

    renderThemeCheckboxes();
}

function renderThemeCheckboxes() {
    const visibleThemes = getSeasonThemes();

    dom.themeCheckboxList.replaceChildren(
        ...visibleThemes.map(theme => {
            const row = document.createElement('label');
            row.className = 'theme-checkbox-row';
            row.innerHTML = `<input type="checkbox" value="${theme}" ${state.filters.themes.includes(theme) ? 'checked' : ''}> ${escapeHTML(getUiThemeLabel(theme))}`;
            return row;
        })
    );

    updateThemeToggleLabel();
}

function updateThemeToggleLabel(availableThemes = getActiveThemes(baseSprites)) {
    const selectedCount = state.filters.themes.length;
    if (selectedCount === 0) {
        dom.themeToggle.textContent = 'No Themes';
    } else if (selectedCount >= availableThemes.length) {
        dom.themeToggle.textContent = 'All Themes';
    } else {
        dom.themeToggle.textContent = `${selectedCount} Theme${selectedCount === 1 ? '' : 's'}`;
    }
}

function renderGrid() {
    let items = filterSprites();
    items = sortSprites(items, state.settings.sortOrder);

    let redeemed = [];
    try {
        redeemed = JSON.parse(localStorage.getItem(REDEEMED_KEY)) || [];
    } catch {
        redeemed = [];
    }
    const hackableRewards = new Set(
        baseCodes
            .filter(c => c.active && !redeemed.includes(c.code) && c.internalreward)
            .map(c => c.internalreward)
    );
    // Every Cheat Master sprite with a currently-active code on the lobby hacks
    // page, regardless of redeemed status. Recomputed on every render, so
    // adding new codes to codes-data.js automatically unlocks the matching sprite.
    const activeCodeRewards = new Set(
        baseCodes.filter(c => c.active && c.internalreward).map(c => c.internalreward)
    );

    const frag = document.createDocumentFragment();

    for (const sprite of items) {
        const obtained = isObtained(sprite.id);
        const mastered = isMastered(sprite.id);
		const isCodeLockedSprite = sprite.codeLocked === true && !sprite.cheatCodeExempt && !obtained;
		const hasCodeTag = sprite.code === true && !obtained;
		const hasHack = (isCodeLockedSprite || hasCodeTag) && hackableRewards.has(sprite.id);
		const isUnavailable = isCodeLockedSprite && !activeCodeRewards.has(sprite.id);

        const card = document.createElement('div');
        card.dataset.id = sprite.id;

        const classes = ['card', `rarity-${sprite.rarity}`, `theme-${sprite.theme}`];
        if (obtained) classes.push('obtained');
        if (mastered) classes.push('mastered');
        if (hasHack) classes.push('hack-available');
        if (isUnavailable) classes.push('hack-unavailable');
        card.className = classes.join(' ');

        if (!state.viewMode) {
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            card.setAttribute('aria-pressed', String(obtained));
            card.setAttribute('aria-label', `${obtained ? 'Remove' : 'Mark'} ${sprite.name} ${obtained ? 'from' : 'as part of'} your collection`);
        }

        let cardHTML = buildCardHTML(sprite, obtained, mastered);
        if (hasHack) {
            cardHTML = `<a href="codes" class="hack-badge hack-available-badge" aria-label="View the lobby hack code for ${escapeHTML(sprite.name)}">Hack Available</a>` + cardHTML;
        } else if (isUnavailable) {
            cardHTML = `<div class="hack-badge hack-unavailable-badge">Unavailable</div>` + cardHTML;
        }

        card.innerHTML = cardHTML;
        frag.appendChild(card);
    }

    dom.grid.innerHTML = '';
    dom.grid.appendChild(frag);
    fitCardNames();
    updateProgress();
}

function updateCardElement(id) {
    const card = dom.grid.querySelector(`.card[data-id="${id}"]`);
    if (!card) {
        renderGrid();
        return;
    }

    const sprite = baseSprites.find(s => s.id === id);
    if (!sprite) return;

    const obtained = isObtained(id);
    const mastered = isMastered(id);

    card.classList.toggle('obtained', obtained);
    card.classList.toggle('mastered', mastered);
    card.setAttribute('aria-pressed', String(obtained));

    let badge = '';
    if (sprite.unreleased) {
        badge = '<div class="card-badge unreleased-badge">Unreleased</div>';
    } else if (mastered) {
        badge = '<div class="card-badge mastered-badge">Mastered</div>';
    } else if (obtained) {
        badge = '<div class="card-badge collected">Collected</div>';
    }

    let crownAction = '';
    if (obtained && !mastered && !state.viewMode) {
        crownAction = `<button class="card-crown" type="button" title="Toggle mastery" aria-label="Mark ${escapeHTML(sprite.name)} as mastered">${CROWN_ICON}</button>`;
    }

    let crownDisplay = '';
    if (mastered) {
        crownDisplay = `<div class="card-crown-display">${CROWN_ICON}</div>`;
    }

    const displayEl = card.querySelector('.card-display');
    card.querySelectorAll('.card-badge, .card-crown, .card-crown-display').forEach(el => el.remove());

    if (badge) card.insertAdjacentHTML('afterbegin', badge);
    if (crownAction) card.insertAdjacentHTML('afterbegin', crownAction);
    if (crownDisplay && displayEl) displayEl.insertAdjacentHTML('afterbegin', crownDisplay);
}

function buildCardHTML(sprite, obtained, mastered) {
    const tagText = sprite.rarity.toUpperCase();
    
    const imgPath = `sprites/${encodeURIComponent(sprite.id)}.png`;
    const safeName = escapeHTML(sprite.name);
    const safeTagText = escapeHTML(tagText);
    const themeLabel = escapeHTML(`${getUiThemeLabel(sprite.theme)} Sprite`.toUpperCase());

    let badge = '';
    if (sprite.unreleased) {
        badge = '<div class="card-badge unreleased-badge">Unreleased</div>';
    } else if (mastered) {
        badge = '<div class="card-badge mastered-badge">Mastered</div>';
    } else if (obtained) {
        badge = '<div class="card-badge collected">Collected</div>';
    }

    let crownAction = '';
    if (obtained && !mastered && !state.viewMode) {
        crownAction = `<button class="card-crown" type="button" title="Toggle mastery" aria-label="Mark ${safeName} as mastered">${CROWN_ICON}</button>`;
    }

    let crownDisplay = '';
    if (mastered) {
        crownDisplay = `<div class="card-crown-display">${CROWN_ICON}</div>`;
    }

    return `<div class="card-theme-label"><span>${themeLabel}</span></div>${badge}${crownAction}
        <div class="card-display">
            ${crownDisplay}
            <img src="${imgPath}" alt="${safeName}" loading="lazy">
            <div class="card-rarity">${safeTagText}</div>
        </div>
        <div class="card-name"><span>${safeName}</span></div>`;
}

function fitCardNames() {
    const range = document.createRange();
    dom.grid.querySelectorAll('.card-name span, .card-theme-label span').forEach(span => {
        span.style.transform = '';
        span.style.transformOrigin = '';
        span.style.fontSize = '';

        const availableWidth = span.clientWidth;
        if (availableWidth === 0) return;

        range.selectNodeContents(span);
        let textWidth = range.getBoundingClientRect().width;
        if (textWidth <= availableWidth) return;

        const startSize = parseFloat(window.getComputedStyle(span).fontSize);
        const minSize = 8;
        let fontSize = startSize;

        while (textWidth > availableWidth && fontSize > minSize) {
            fontSize -= 0.5;
            span.style.fontSize = `${fontSize}px`;
            range.selectNodeContents(span);
            textWidth = range.getBoundingClientRect().width;
        }
    });
}

/* ===================================================
   Collection Actions
   =================================================== */

function toggleObtained(id) {
    const sprite = baseSprites.find(s => s.id === id);

    if (isObtained(id)) {
        state.obtained = state.obtained.filter(x => x !== id);
        state.mastered = state.mastered.filter(x => x !== id);
    } else {
        state.obtained.push(id);
    }
    saveCollection();

    // Cheat Master sprites show a Hack Available/Unavailable badge that depends
    // on obtained status, so a full re-render is needed to keep that in sync.
    if (sprite && (sprite.codeLocked === true || sprite.code === true)) {
        renderGrid();
    } else {
        updateCardElement(id);
    }
    updateProgress();
    checkUnredeemedCodes();
}

function toggleMastery(id) {
    if (!isObtained(id)) return;
    if (isMastered(id)) {
        state.mastered = state.mastered.filter(x => x !== id);
    } else {
        state.mastered.push(id);
    }
    saveCollection();

    // Hide Mastered removes newly-mastered cards from the grid entirely, so a
    // full re-render is needed to reflect that immediately instead of just
    // updating the now-stale card in place.
    if (state.settings.hideMastered) {
        renderGrid();
    } else {
        updateCardElement(id);
    }
    updateProgress();
}

/* ===================================================
   Canvas Export - Helpers
   =================================================== */

function getRarityGradient(rarity) {
    const map = {
        Rare: ['#104273', '#081a35'],
        Epic: ['#4d1566', '#1e052c'],
        Legendary: ['#743e0a', '#301702'],
        Mythic: ['#70531c', '#2e2107'],
    };
    return map[rarity] || map.Rare;
}

function getRarityTagColors(rarity) {
    const map = {
        Rare: ['#004A8E', '#00FFFB'], 
        Epic: ['#511D7F', '#ED2BFF'],
        Legendary: ['#8E4122', '#FBC568'], 
        Mythic: ['#80622A', '#FFF1A9'],
    };
    return map[rarity] || map.Rare;
}

function getThemeLabelColor(theme) {
    const map = {
        Basic: '#334155',
        Gold: '#855f10',
        Candy: '#942157',
        Galaxy: '#321c73',
        Gem: '#166e66',
        Holofoil: '#2b5c73',
        Cube: '#6825c2',
        Rift: '#1d6a85',
        Quack: '#48357a',
        Cheat: '#15803d',
        Hacker: '#7e22ce',
        Bounty: '#ef5ee1',
        Reaper: '#3a1f52',
        Tricktreat: '#e8740c',
		Fortune: '#b91c1c',
        Cursed: '#77574D',
    };
    return map[theme] || map.Basic;
}

function getExportConfig(mode) {
    let releasedSprites = getExportableSprites();

    // Filter exported items by active theme selection
    releasedSprites = releasedSprites.filter(s => state.filters.themes.includes(s.theme));
	
    let rawItems = [];

    if (mode === 'collected') rawItems = releasedSprites.filter(sprite => isObtained(sprite.id));
    else if (mode === 'missing') rawItems = releasedSprites.filter(sprite => !isObtained(sprite.id));
    else if (mode === 'unmastered') rawItems = releasedSprites.filter(sprite => isObtained(sprite.id) && !isMastered(sprite.id));
    else if (mode === 'mastered') rawItems = releasedSprites.filter(sprite => isObtained(sprite.id) && isMastered(sprite.id));
    else if (mode === 'trade') rawItems = releasedSprites;

    const items = mode === 'trade' ? rawItems : sortSprites(rawItems, state.settings.sortOrder);

    const configs = {
        collected: {
            items, titleL1: 'RICK\'S TRACKER:', titleL2: 'MY COLLECTION',
            color: '#32cd32', filename: 'fnsprites-collection', emptyMsg: 'No collected sprites to export!',
        },
        missing: {
            items, titleL1: 'RICK\'S TRACKER:', titleL2: "I'M LOOKING FOR THESE!",
            color: '#ef4444', filename: 'fnsprites-missing', emptyMsg: "You aren't missing any released sprites!",
        },
        unmastered: {
            items, titleL1: 'RICK\'S TRACKER:', titleL2: 'UNMASTERED SPRITES',
            color: '#00f0ff', filename: 'fnsprites-unmastered', emptyMsg: "You don't have any unmastered sprites!",
        },
        mastered: {
            items, titleL1: 'RICK\'S TRACKER:', titleL2: 'MASTERED SPRITES',
            color: '#ffd700', filename: 'fnsprites-mastered', emptyMsg: "You don't have any mastered sprites!",
        },
        trade: {
            items, titleL1: 'RICK\'S TRACKER:', titleL2: 'TRADE CARD',
            color: '#ffd700', filename: 'fnsprites-trade-card', emptyMsg: 'No sprites to export!',
        },
    };

    const config = configs[mode];
    if (!config || config.items.length === 0) {
        toast(config?.emptyMsg || 'Nothing to export!', 'error');
        return null;
    }
    return config;
}

function getExportCardState(sprite, mode) {
    const isOwned = isObtained(sprite.id);
    const mastered = isMastered(sprite.id);

    if (mode === 'trade') return isOwned ? (mastered ? 'mastered' : 'owned') : 'missing_gray';
    if (mode === 'collected') return isOwned ? (mastered ? 'mastered' : 'owned') : 'empty';
    if (mode === 'missing') return !isOwned ? 'missing_color' : 'empty';
    if (mode === 'mastered') return mastered ? 'mastered' : 'empty';
    if (mode === 'unmastered') return isOwned && !mastered ? 'unmastered' : 'empty';
    return 'empty';
}

function loadImage(item) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve({ id: item.id, img, success: true });
        img.onerror = () => resolve({ id: item.id, img, success: false });
        img.src = item.src;
    });
}

function drawCrown(ctx, cx, cy) {
    ctx.save();
    ctx.fillStyle = '#ffd700';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.2;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy + 5);
    ctx.lineTo(cx + 7, cy + 5);
    ctx.lineTo(cx + 7, cy - 2);
    ctx.lineTo(cx + 3, cy + 1.5);
    ctx.lineTo(cx, cy - 4.5);
    ctx.lineTo(cx - 3, cy + 1.5);
    ctx.lineTo(cx - 7, cy - 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

function drawMiniCard(ctx, sprite, x, y, width, height, cardState, imageMap) {
    const rarity = sprite.rarity;
    const theme = sprite.theme;

    const isMastered = cardState === 'mastered';
    const isMissing = cardState === 'missing_gray' || cardState === 'missing_color' || cardState === 'empty';
    const isDimmed = cardState === 'missing_gray' || cardState === 'empty';

    const [bgTop, bgBottom] = getRarityGradient(rarity);
    const [tagBg, tagTextColor] = getRarityTagColors(rarity);
    const themeLabelColor = getThemeLabelColor(theme);

    const themeLabelH = 12;
    const barHeight = 34;
    const imageAreaY = y + themeLabelH;
    const imageAreaH = height - barHeight - themeLabelH;

    // Round the whole card's corners to match the on-screen card shape.
    // Gradients always render at full quality here regardless of the site's
    // Low Fidelity setting — that toggle only simplifies live DOM rendering,
    // exported images are static and unaffected by it.
    ctx.save();
    ctx.beginPath();
    drawRoundRect(ctx, x, y, width, height, 8);
    ctx.clip();

    // Dim the entire card - not just the artwork - for uncollected/empty slots
    // so they read as obviously uncollected at a glance instead of nearly
    // matching owned cards.
    if (isDimmed) {
        ctx.globalAlpha = 0.28;
    }

    // Theme label bar, above the sprite image (matches on-screen .card-theme-label)
    ctx.fillStyle = themeLabelColor;
    ctx.fillRect(x, y, width, themeLabelH);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${getUiThemeLabel(theme)} Sprite`.toUpperCase(), x + width / 2, y + themeLabelH / 2 + 0.5);

    // Card background gradient, based purely on rarity (matches on-screen .card-display background)
    const grad = ctx.createLinearGradient(x, imageAreaY, x, imageAreaY + imageAreaH);
    grad.addColorStop(0, bgTop);
    grad.addColorStop(1, bgBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(x, imageAreaY, width, imageAreaH);

    // Sprite image, fit to the display area like object-fit: contain
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, imageAreaY, width, imageAreaH);
    ctx.clip();

    const img = imageMap[sprite.id];
    if (img && img.width && img.height) {
        if (isDimmed) {
            if ('filter' in ctx) ctx.filter = 'grayscale(100%)';
        } else if (isMissing) {
            ctx.globalAlpha = 0.8;
            if ('filter' in ctx) ctx.filter = 'saturate(75%) brightness(90%)';
        }

        const padding = 8;
        const availW = width - padding * 2;
        const availH = imageAreaH - padding * 2;
        const imgRatio = img.width / img.height;
        const boxRatio = availW / availH;
        let drawW, drawH;
        if (imgRatio > boxRatio) {
            drawW = availW;
            drawH = availW / imgRatio;
        } else {
            drawH = availH;
            drawW = availH * imgRatio;
        }

        // Zoom in to match the live grid's card image scaling; the clip region
        // above crops it to the card bounds the same way CSS overflow: hidden does.
        const zoom = 1.2;
        drawW *= zoom;
        drawH *= zoom;

        const drawX = x + (width - drawW) / 2;
        const drawY = imageAreaY + (imageAreaH - drawH) / 2;
        ctx.drawImage(img, drawX, drawY, drawW, drawH);

        ctx.globalAlpha = 1;
        if ('filter' in ctx) ctx.filter = 'none';
    }
    ctx.restore();

    // Crown icon for mastered sprites (matches on-screen .card-crown-display)
    if (isMastered) {
        drawCrown(ctx, x + width - 14, imageAreaY + 14);
    }

    // Status badge, top-left (matches on-screen .card-badge)
    let badgeText = null, badgeColor = null, badgeTextColor = '#ffffff';
    if (sprite.unreleased) {
        badgeText = 'UNRELEASED';
        badgeColor = 'rgba(239, 68, 68, 0.9)';
    } else if (isMastered) {
        badgeText = 'MASTERED';
        badgeColor = 'rgba(255, 215, 0, 0.95)';
        badgeTextColor = '#1a1200';
    } else if (!isMissing) {
        badgeText = 'COLLECTED';
        badgeColor = 'rgba(34, 197, 94, 0.9)';
    }
    if (badgeText) {
        ctx.font = 'bold 8px sans-serif';
        const textW = ctx.measureText(badgeText).width;
        const padX = 5;
        const bw = textW + padX * 2;
        const bh = 13;
        ctx.fillStyle = badgeColor;
        ctx.fillRect(x + 4, imageAreaY + 4, bw, bh);
        ctx.fillStyle = badgeTextColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeText, x + 4 + padX, imageAreaY + 4 + bh / 2 + 0.5);
    }

    // Rarity tag ribbon, bottom-left of the image area (matches on-screen .card-rarity)
    const tagLabel = rarity.toUpperCase();
    ctx.font = 'bold 9px sans-serif';
    const tagW = ctx.measureText(tagLabel).width + 12;
    const tagH = 14;
    const tagY = imageAreaY + imageAreaH - tagH;
    ctx.fillStyle = tagBg;
    ctx.fillRect(x, tagY, Math.min(tagW, width), tagH);
    ctx.fillStyle = tagTextColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tagLabel, x + Math.min(tagW, width) / 2, tagY + tagH / 2 + 0.5);

    // Bottom name bar, colored to match the theme label above (matches on-screen .card-name)
    const barY = y + height - barHeight;
    ctx.fillStyle = themeLabelColor;
    ctx.fillRect(x, barY, width, barHeight);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, barY, width, barHeight);

    // Sprite name, centered and squished to fit like the on-screen card name.
    // Sprite data stores just the base name (e.g. "Shadow"), so exports prepend
    // the actual theme name to match how names have always looked in exports
    // (e.g. "Gold Shadow", "Cube Fishy"). Basic sprites are left unprefixed.
    const displayName = theme === 'Basic' ? sprite.name : `${getUiThemeLabel(theme)} ${sprite.name}`;
    const nameY = barY + (barHeight / 2);
    const maxTextWidth = width - 10;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';

    const textWidth = ctx.measureText(displayName).width;
    if (textWidth > maxTextWidth) {
        const scale = maxTextWidth / textWidth;
        ctx.translate(x + (width / 2), nameY);
        ctx.scale(scale, 1);
        ctx.fillText(displayName, 0, 0);
    } else {
        ctx.fillText(displayName, x + (width / 2), nameY);
    }
    ctx.restore();

    ctx.restore();
}

/* ===================================================
   Canvas Export
   =================================================== */

function drawRoundRect(ctx, x, y, width, height, radius) {
    if (ctx.roundRect) {
        ctx.roundRect(x, y, width, height, radius);
    } else {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}

function exportImage(mode) {
    const config = getExportConfig(mode);
    if (!config) return;

    const releasedSprites = getExportableSprites();
    const imagesToLoad = [
        { id: 'mascot', src: 'siteimages/staticsprite.png' },
        ...releasedSprites.map(sprite => ({ id: sprite.id, src: `sprites/${encodeURIComponent(sprite.id)}.png` })),
    ];

    toast('Generating image export...', 'info');

    Promise.all(imagesToLoad.map(loadImage)).then(loadedImages => {
        const imageMap = {};
        loadedImages.forEach(res => {
            if (res.success) {
                imageMap[res.id] = res.img;
            }
        });

        const layout = EXPORT_LAYOUT;
        const headerH = layout.headerH;
        let canvasW, canvasH, startGridY = 0, gridWidth = 0;
        let cols = 0, rows = 0;

        let charKeys, familyThemeMap, themeColumns, leftColumnKeys, rightColumnKeys, tableColumnCount, colW, tableW;

        // A throwaway context purely for measuring text before the real,
        // final-size canvas exists (font metrics don't depend on canvas size).
        const measureCtx = document.createElement('canvas').getContext('2d');

        const fitFont = (ctx2, text, maxWidth, startSize, minSize, style) => {
            let size = startSize;
            ctx2.font = `${style} ${size}px "Oswald", sans-serif`;
            while (ctx2.measureText(text).width > maxWidth && size > minSize) {
                size -= 0.5;
                ctx2.font = `${style} ${size}px "Oswald", sans-serif`;
            }
            return size;
        };

        const bw = 110;
        const statGap = 25;
        const statsW = bw * 2 + statGap;
        const statsTitleGap = 20;
        const mascotImg = imageMap['mascot'];
        const fullTitle = `${config.titleL1} ${config.titleL2}`;
        const mascotSize = 32;
        const mascotGap = mascotImg ? 10 : 0;
        const titleStartSize = 26;
        const titleMinSize = 16;

        // Smallest width the title can be shrunk to while still reading fine -
        // used to decide whether COLLECTION/MASTERY can share the header row.
        measureCtx.font = `italic 900 ${titleMinSize}px "Oswald", sans-serif`;
        const minTitleBlockW = mascotSize + mascotGap + measureCtx.measureText(fullTitle).width;

        if (mode === 'trade') {
            charKeys = getFamilyKeys(releasedSprites);
            familyThemeMap = getFamilyThemeMap(releasedSprites);
            themeColumns = getActiveThemes(releasedSprites).map(theme => ({
                name: getExportThemeLabel(theme),
                themeName: theme,
            }));

            const activeCharKeys = charKeys.filter(charKey => {
                return [...familyThemeMap.get(charKey).values()]
                    .some(sprite => getExportCardState(sprite, mode) !== 'empty');
            });

            themeColumns = themeColumns.filter(t => {
                return activeCharKeys.some(charKey => {
                    const sprite = familyThemeMap.get(charKey).get(t.themeName);
                    return sprite && getExportCardState(sprite, mode) !== 'empty';
                });
            });

            tableColumnCount = activeCharKeys.length > layout.maxSingleColumnRows ? 2 : 1;
            const half = tableColumnCount === 1 ? activeCharKeys.length : Math.ceil(activeCharKeys.length / 2);
            leftColumnKeys = activeCharKeys.slice(0, half);
            rightColumnKeys = activeCharKeys.slice(half);

            const maxRows = Math.max(leftColumnKeys.length, rightColumnKeys.length);
            const rowH = layout.cardH + layout.rowGap;
            const rowsH = maxRows * rowH;
            const cardBlockW = themeColumns.length * layout.cardW + Math.max(0, themeColumns.length - 1) * layout.cardGap;
            colW = layout.labelW + cardBlockW;
            tableW = colW * tableColumnCount + layout.colGap * Math.max(0, tableColumnCount - 1);
            canvasW = Math.max(layout.minCanvasW, tableW + layout.border * 2 + layout.sidePad * 2);

            // The trade card always shows COLLECTION/MASTERY - widen the canvas
            // rather than ever letting the stats crowd, overlap, or get dropped.
            const neededForStats = layout.border * 2 + layout.sidePad * 2 + minTitleBlockW + statsTitleGap + statsW;
            canvasW = Math.max(canvasW, neededForStats);

            canvasH = layout.border * 2 + headerH + layout.colHeaderH + rowsH + layout.footerH;
        } else {
            const totalItems = config.items.length;
            const cardAspect = (layout.cardW + layout.cardGap) / (layout.cardH + layout.rowGap);

            if (totalItems <= 6) {
                // Small exports keep the same 3-column width the header/title is
                // sized for, rather than the sqrt-based layout going narrower.
                cols = 3;
                rows = totalItems <= 3 ? 1 : 2;
            } else {
                cols = Math.max(1, Math.round(Math.sqrt(totalItems / cardAspect)));
                rows = Math.ceil(totalItems / cols);
            }

            gridWidth = cols * layout.cardW + (cols - 1) * layout.cardGap;
            canvasW = Math.max(layout.minCanvasW, gridWidth + layout.border * 2 + layout.sidePad * 2);

            // Pad extra blank rows onto the bottom so the exported image lands
            // close to square - Discord's unexpanded link preview effectively
            // crops to a square, so a wide/short grid would otherwise get cut off.
            const targetGridH = canvasW - (layout.border * 2 + headerH + layout.sidePad * 2 + layout.footerH);
            const targetRows = Math.ceil((targetGridH + layout.rowGap) / (layout.cardH + layout.rowGap));
            rows = Math.max(rows, targetRows);

            const gridHeight = rows * layout.cardH + (rows - 1) * layout.rowGap;
            canvasH = layout.border * 2 + headerH + layout.sidePad + gridHeight + layout.sidePad + layout.footerH;
            startGridY = layout.border + headerH + layout.sidePad;
        }

        const scale = 2;
        const canvas = document.createElement('canvas');
        canvas.width = canvasW * scale;
        canvas.height = canvasH * scale;

        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        let borderGrad;
        if (mode === 'trade') {
            borderGrad = ctx.createLinearGradient(0, 0, canvasW, canvasH);
            borderGrad.addColorStop(0, '#ffd700');
            borderGrad.addColorStop(1, '#22c55e');
            ctx.fillStyle = borderGrad;
        } else {
            ctx.fillStyle = config.color;
            borderGrad = config.color;
        }
        ctx.fillRect(0, 0, canvasW, canvasH);

        ctx.fillStyle = '#0b0d13';
        ctx.fillRect(layout.border, layout.border, canvasW - layout.border * 2, canvasH - layout.border * 2);

        ctx.fillStyle = '#181c25';
        ctx.fillRect(layout.border, layout.border, canvasW - layout.border * 2, headerH);

        ctx.strokeStyle = borderGrad;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(layout.border, layout.border + headerH);
        ctx.lineTo(canvasW - layout.border, layout.border + headerH);
        ctx.stroke();

        const { total: totalCount, collected: ownedCount, mastered: masteredCount } = getCollectionCounts(releasedSprites);
        const colPct = totalCount > 0 ? ownedCount / totalCount : 0;
        const masPct = totalCount > 0 ? masteredCount / totalCount : 0;

        const drawProgressBlock = (label, count, total, pct, x, y, color) => {
            ctx.font = '900 12px "Oswald", sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = color;
            ctx.fillText(`${label}: ${count}/${total}`, x, y);
            ctx.fillStyle = '#0e1117';
            ctx.fillRect(x, y + 15, bw, 12);
            ctx.strokeStyle = '#3b4253';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x, y + 15, bw, 12);
            ctx.fillStyle = color;
            ctx.fillRect(x, y + 16, bw * pct, 10);
        };

        // Single-line, left-aligned header - the trade card's layout, now used
        // for every export type. COLLECTION/MASTERY sit to the right when
        // there's room; the trade card's canvas was already widened above so
        // it always has room.
        const statsRight = canvasW - layout.border - layout.sidePad;
        const collectionX = statsRight - bw * 2 - statGap;
        const masteryX = statsRight - bw;
        const titleX = layout.border + layout.sidePad;
        const fullWidthAvailable = canvasW - titleX - layout.border - layout.sidePad;
        const widthAvailableWithStats = collectionX - titleX - statsTitleGap;
        const showStats = mode === 'trade' || widthAvailableWithStats >= minTitleBlockW;

        const titleMaxW = (showStats ? widthAvailableWithStats : fullWidthAvailable) - mascotSize - mascotGap;
        fitFont(ctx, fullTitle, titleMaxW, titleStartSize, titleMinSize, 'italic 900');
        ctx.fillStyle = borderGrad;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        let textLeft = titleX;
        if (mascotImg) {
            ctx.drawImage(mascotImg, textLeft, layout.border + headerH / 2 - mascotSize / 2, mascotSize, mascotSize);
            textLeft += mascotSize + mascotGap;
        }
        ctx.fillText(fullTitle, textLeft, layout.border + headerH / 2);

        if (showStats) {
            const statsY = layout.border + headerH / 2 - 8;
            drawProgressBlock('COLLECTION', ownedCount, totalCount, colPct, collectionX, statsY, '#22c55e');
            drawProgressBlock('MASTERY', masteredCount, totalCount, masPct, masteryX, statsY, '#ffd700');
        }

        if (mode === 'trade') {
            const startTableY = layout.border + headerH + layout.colHeaderH;

            const drawColHeaders = (startX) => {
                ctx.fillStyle = '#8891a5';
                ctx.font = 'bold 12px "Oswald", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                themeColumns.forEach((t, i) => {
                    const cx = startX + layout.labelW + i * (layout.cardW + layout.cardGap) + layout.cardW / 2;
                    ctx.fillText(t.name, cx, startTableY - 8);
                });
            };

            const leftTableX = layout.border + (canvasW - layout.border * 2 - tableW) / 2;
            const rightTableX = leftTableX + colW + layout.colGap;

            drawColHeaders(leftTableX);
            if (rightColumnKeys.length > 0) {
                drawColHeaders(rightTableX);
            }

            const drawRow = (charKey, startX, y) => {
                const name = getCharName(charKey);
                const displayName = getDisplayName(name);

                ctx.fillStyle = '#ffffff';
                let fontSize = 14;
                ctx.font = `bold ${fontSize}px "Oswald", sans-serif`;
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                while (ctx.measureText(displayName).width > layout.labelW - 12 && fontSize > 8) {
                    fontSize -= 0.5;
                    ctx.font = `bold ${fontSize}px "Oswald", sans-serif`;
                }
                ctx.fillText(displayName, startX + layout.labelW - 10, y + layout.cardH / 2);

                const rowCards = themeColumns.map(t => familyThemeMap.get(charKey).get(t.themeName));

                rowCards.forEach((s, colIndex) => {
                    const cx = startX + layout.labelW + colIndex * (layout.cardW + layout.cardGap);

                    if (s) {
                        const cardState = getExportCardState(s, mode);
                        drawMiniCard(ctx, s, cx, y, layout.cardW, layout.cardH, cardState, imageMap);
                    } else {
                        ctx.save();
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                        ctx.lineWidth = 1;
                        ctx.setLineDash([4, 4]);
                        ctx.beginPath();
                        drawRoundRect(ctx, cx, y, layout.cardW, layout.cardH, 8);
                        ctx.stroke();
                        ctx.restore();
                    }
                });
            };

            leftColumnKeys.forEach((charKey, idx) => {
                const y = startTableY + idx * (layout.cardH + layout.rowGap);
                drawRow(charKey, leftTableX, y);
            });

            rightColumnKeys.forEach((charKey, idx) => {
                const y = startTableY + idx * (layout.cardH + layout.rowGap);
                drawRow(charKey, rightTableX, y);
            });
        } else {
            const startGridX = (canvasW - gridWidth) / 2;

            config.items.forEach((sprite, index) => {
                const col = index % cols;
                const row = Math.floor(index / cols);

                const x = startGridX + col * (layout.cardW + layout.cardGap);
                const y = startGridY + row * (layout.cardH + layout.rowGap);

                const cardState = getExportCardState(sprite, mode);
                drawMiniCard(ctx, sprite, x, y, layout.cardW, layout.cardH, cardState, imageMap);
            });
        }

        ctx.fillStyle = '#0e1117';
        ctx.fillRect(layout.border, canvasH - layout.footerH - layout.border, canvasW - layout.border * 2, layout.footerH);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px "Oswald", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('rickventure.com', canvasW / 2, canvasH - layout.border - layout.footerH / 2);

        const shouldOpenInNewTab = isIOS() || state.settings.openExports;
        
        if (shouldOpenInNewTab) {
            canvas.toBlob((blob) => {
                if (!blob) {
                    toast('Failed to generate image', 'error');
                    return;
                }
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
                toast('Image opened in new tab!', 'success');
            }, 'image/png');
        } else {
            const link = document.createElement('a');
            link.download = `${config.filename}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast('Image exported successfully!', 'success');
        }
    });
}

/* ===================================================
   Trade Text Generation
   =================================================== */

function generateTradeText() {
    const releasedSprites = getExportableSprites();
    const charKeys = getFamilyKeys(releasedSprites);
    const familyThemeMap = getFamilyThemeMap(releasedSprites);
    const { total, collected, mastered } = getCollectionCounts(releasedSprites);

    const buildSection = (title, selectSprites) => {
        const lines = [];

        charKeys.forEach(charKey => {
            const name = getCharName(charKey);
            const themeSprites = [...familyThemeMap.get(charKey).values()];
            const selected = selectSprites(themeSprites);
            if (selected.length === 0) return;

            const list = selected.map(sprite => getTradeThemeLabel(sprite.theme)).join(', ');
            lines.push(`  ▸ ${name} ➔ ${list}`);
        });

        return lines.length > 0 ? `【 ${title} 】\n${lines.join('\n')}` : '';
    };

    const sections = [
        buildSection('LOOKING FOR', sprites => sprites.filter(sprite => !isObtained(sprite.id))),
        buildSection('HAVE', sprites => sprites.filter(sprite => isObtained(sprite.id))),
        buildSection('STILL NEED TO MASTER', sprites => sprites.filter(sprite => isObtained(sprite.id) && !isMastered(sprite.id))),
        [
            `Collected: ${collected}/${total}`,
            `Mastered: ${mastered}/${total}`,
            `Track yours: ${TRACKER_URL}`,
        ].join('\n'),
    ].filter(Boolean);

    return sections.join('\n\n');
}

function generateTradeGridText() {
    const releasedSprites = getExportableSprites();
    const activeThemes = getActiveThemes(releasedSprites);
    const charKeys = getFamilyKeys(releasedSprites);
    const familyThemeMap = getFamilyThemeMap(releasedSprites);
    const { total, collected, mastered } = getCollectionCounts(releasedSprites);

    let lines = [
        '```',
        '✅ Owned  👑 Mastered  ❌ Missing',
        '',
        `| ${activeThemes.map(getExportThemeLabel).join(' | ')} | Sprite`,
        '-----------------------',
    ];

    charKeys.forEach(charKey => {
        const rowStates = activeThemes.map(theme => {
            const s = familyThemeMap.get(charKey).get(theme);
            if (!s) return '⬛';
            if (isMastered(s.id)) return '👑';
            return isObtained(s.id) ? '✅' : '❌';
        });

        lines.push(`| ${rowStates.join(' | ')} | ${getCharName(charKey)}`);
    });

    lines.push(
        '',
        `Collected: ${collected}/${total}`,
        `Mastered: ${mastered}/${total}`,
        `Track yours: ${TRACKER_URL}`,
        '```'
    );

    return lines.join('\n');
}

function setDropdownOpen(dropdown, toggle, open) {
    dropdown.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
}

function getAllDropdowns() {
    return [
        [dom.exportDropdown, dom.exportToggle],
        [dom.copyDropdown, dom.copyToggle],
        [dom.themeDropdown, dom.themeToggle],
        [dom.statusDropdown, dom.statusToggle],
        [dom.settingsDropdown, dom.settingsToggle],
    ];
}

function closeDropdowns() {
    getAllDropdowns().forEach(([dropdown, toggle]) => setDropdownOpen(dropdown, toggle, false));
}

function copyText(text, successMsg, errorMsg) {
    if (!navigator.clipboard?.writeText) {
        toast(errorMsg, 'error');
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        toast(successMsg, 'success');
    }).catch(() => {
        toast(errorMsg, 'error');
    });
}

/* ===================================================
   Event Binding
   =================================================== */

function bindEvents() {
    dom.grid.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG') {
            e.target.style.opacity = '0.2';
        }
    }, true);

    dom.grid.addEventListener('click', (e) => {
        if (state.viewMode) return;
        if (e.target.closest('.hack-available-badge')) return; // real <a>, let it navigate on its own
        const crown = e.target.closest('.card-crown');
        const card = e.target.closest('.card');
        if (!card) return;

        if (crown) {
            e.stopPropagation();
            toggleMastery(card.dataset.id);
        } else {
            toggleObtained(card.dataset.id);
        }
    });

    dom.grid.addEventListener('keydown', (e) => {
        if (state.viewMode || e.target.closest('.card-crown') || e.target.closest('.hack-available-badge')) return;
        if (e.key !== 'Enter' && e.key !== ' ') return;

        const card = e.target.closest('.card');
        if (!card) return;

        e.preventDefault();
        toggleObtained(card.dataset.id);
    });

    dom.searchInput.addEventListener('input', () => {
        state.filters.search = dom.searchInput.value;
        persist(KEYS.search, state.filters.search);
        renderGrid();
    });

    dom.themeCheckboxList.addEventListener('change', (e) => {
        const checkbox = e.target.closest('input[type="checkbox"]');
        if (!checkbox) return;
        const visibleThemes = getSeasonThemes();
        const checkedVisible = Array.from(dom.themeCheckboxList.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.value);
        const hiddenSelected = state.filters.themes.filter(t => !visibleThemes.includes(t));
        state.filters.themes = [...checkedVisible, ...hiddenSelected];
        persist(KEYS.themes, state.filters.themes);
        updateThemeToggleLabel();
        renderGrid();
    });

    dom.themeSelectAllBtn.addEventListener('click', () => {
        const visibleThemes = getSeasonThemes();
        dom.themeCheckboxList.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = true; });
        const hiddenSelected = state.filters.themes.filter(t => !visibleThemes.includes(t));
        state.filters.themes = [...visibleThemes, ...hiddenSelected];
        persist(KEYS.themes, state.filters.themes);
        updateThemeToggleLabel();
        renderGrid();
    });

    dom.themeClearBtn.addEventListener('click', () => {
        const visibleThemes = getSeasonThemes();
        dom.themeCheckboxList.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = false; });
        const hiddenSelected = state.filters.themes.filter(t => !visibleThemes.includes(t));
        state.filters.themes = [...hiddenSelected];
        persist(KEYS.themes, state.filters.themes);
        updateThemeToggleLabel();
        renderGrid();
    });

    dom.themeToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = !dom.themeDropdown.classList.contains('open');
        closeDropdowns();
        setDropdownOpen(dom.themeDropdown, dom.themeToggle, willOpen);
    });

    dom.seasonFilter.addEventListener('change', () => {
        state.filters.season = dom.seasonFilter.value;
        persist(KEYS.season, state.filters.season);
        renderThemeCheckboxes();
        renderGrid();
    });

    dom.sortOrder.addEventListener('change', () => {
        state.settings.sortOrder = dom.sortOrder.value;
        persist(KEYS.sortOrder, state.settings.sortOrder);
        renderGrid();
    });

    dom.statusMenu.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-status]');
        if (!btn || state.viewMode) return;
        state.filters.status = btn.dataset.status;
        persist(KEYS.status, state.filters.status);
        applyStateToDOM();
        setDropdownOpen(dom.statusDropdown, dom.statusToggle, false);
        renderGrid();
    });

    dom.statusToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = !dom.statusDropdown.classList.contains('open');
        closeDropdowns();
        setDropdownOpen(dom.statusDropdown, dom.statusToggle, willOpen);
    });

    const switchKeys = ['hideMastered', 'showUnreleased', 'lowFidelity', 'openExports'];
    switchKeys.forEach(key => {
        dom[key].addEventListener('change', () => {
            if (key === 'openExports') {
                state.settings.openExports = !dom.openExports.checked;
                persist(KEYS.openExports, state.settings.openExports);
                applyStateToDOM();
            } else {
                state.settings[key] = dom[key].checked;
                persist(KEYS[key], state.settings[key]);
                if (key === 'lowFidelity') {
                    document.body.classList.toggle('low-fidelity', dom[key].checked);
                }
                renderGrid();
            }
        });
    });

    dom.exportToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = !dom.exportDropdown.classList.contains('open');
        closeDropdowns();
        setDropdownOpen(dom.exportDropdown, dom.exportToggle, willOpen);
    });

    dom.exportDropdown.querySelectorAll('[data-export]').forEach(btn => {
        btn.addEventListener('click', () => {
            exportImage(btn.dataset.export);
            setDropdownOpen(dom.exportDropdown, dom.exportToggle, false);
        });
    });

    dom.copyToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = !dom.copyDropdown.classList.contains('open');
        closeDropdowns();
        setDropdownOpen(dom.copyDropdown, dom.copyToggle, willOpen);
    });

    dom.settingsToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = !dom.settingsDropdown.classList.contains('open');
        closeDropdowns();
        setDropdownOpen(dom.settingsDropdown, dom.settingsToggle, willOpen);
    });

    document.addEventListener('click', (e) => {
        getAllDropdowns().forEach(([dropdown, toggle]) => {
            if (!dropdown.contains(e.target)) {
                setDropdownOpen(dropdown, toggle, false);
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDropdowns();
    });

    dom.settingsExportBackupBtn.addEventListener('click', () => {
        let redeemed = [];
        try {
            redeemed = JSON.parse(localStorage.getItem(REDEEMED_KEY)) || [];
        } catch {
            redeemed = [];
        }

        const data = {
            obtained: state.obtained,
            mastered: state.mastered,
            redeemed,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'fnsprites-backup.json';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast('Backup file exported!', 'success');
        setDropdownOpen(dom.settingsDropdown, dom.settingsToggle, false);
    });

    dom.settingsImportBtn.addEventListener('click', () => {
        if (state.viewMode) {
            toast('Cannot import in view-only mode!', 'error');
            return;
        }
        dom.importInput.click();
    });

    dom.importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (!data || !Array.isArray(data.obtained) || !Array.isArray(data.mastered)) {
                    throw new Error('Invalid backup file format');
                }

                const validIds = getSpriteIdSet();
                const obtained = uniqueValidIds(data.obtained, validIds);
                const obtainedIds = new Set(obtained);
                const mastered = uniqueValidIds(data.mastered, validIds)
                    .filter(id => obtainedIds.has(id));

                state.obtained = obtained;
                state.mastered = mastered;
                saveCollection();

                if (Array.isArray(data.redeemed) && typeof baseCodes !== 'undefined') {
                    const validCodes = new Set(baseCodes.map(c => c.code));
                    const redeemed = [...new Set(data.redeemed)].filter(code => validCodes.has(code));
                    localStorage.setItem(REDEEMED_KEY, JSON.stringify(redeemed));
                }

                renderGrid();
                checkUnredeemedCodes();
                toast('Collection imported successfully!', 'success');
            } catch (err) {
                toast('Failed to import: invalid JSON format', 'error');
                console.error(err);
            }
            dom.importInput.value = '';
            setDropdownOpen(dom.settingsDropdown, dom.settingsToggle, false);
        };
        reader.readAsText(file);
    });

    if (dom.spriteListUrl) {
        dom.spriteListUrl.addEventListener('change', () => {
            setSpriteListSourceUrl(dom.spriteListUrl.value);
        });
        dom.spriteListUrl.addEventListener('blur', () => {
            setSpriteListSourceUrl(dom.spriteListUrl.value);
        });
    }

    if (dom.spriteListAuto) {
        dom.spriteListAuto.addEventListener('change', () => {
            setSpriteListAutoUpdate(dom.spriteListAuto.checked);
            setSpriteListStatus(dom.spriteListAuto.checked ? 'Auto-update enabled.' : 'Auto-update disabled.');
        });
    }

    if (dom.spriteListUpdateBtn) {
        dom.spriteListUpdateBtn.addEventListener('click', () => {
            if (dom.spriteListUrl) setSpriteListSourceUrl(dom.spriteListUrl.value);
            updateSpriteListFromSource({ silent: false });
        });
    }

    if (dom.spriteListImportBtn && dom.spriteListImportInput) {
        dom.spriteListImportBtn.addEventListener('click', () => {
            dom.spriteListImportInput.click();
        });
    }

    if (dom.spriteListImportInput) {
        dom.spriteListImportInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    const sprites = normalizeSpriteList(data);
                    if (!sprites) throw new Error('Invalid sprite list format');
                    cacheSpriteList(sprites);
                    applySpriteList(sprites, { silent: false });
                    setSpriteListStatus(`Imported ${sprites.length} sprites from file.`);
                } catch (err) {
                    toast('Failed to import sprite list: invalid JSON', 'error');
                    console.error(err);
                }
                dom.spriteListImportInput.value = '';
            };
            reader.readAsText(file);
        });
    }

    dom.copyTradeTextBtn.addEventListener('click', () => {
        copyText(generateTradeText(), 'Trade list copied to clipboard!', 'Failed to copy trade list');
        setDropdownOpen(dom.copyDropdown, dom.copyToggle, false);
    });

    dom.copyTradeGridBtn.addEventListener('click', () => {
        copyText(generateTradeGridText(), 'Trade grid copied to clipboard!', 'Failed to copy trade grid');
        setDropdownOpen(dom.copyDropdown, dom.copyToggle, false);
    });
}

function showFloatingCopyText(anchorElement) {
    const textEl = document.createElement('div');
    textEl.className = 'floating-copy-text';
    textEl.textContent = 'Code copied to clipboard!';

    const rect = anchorElement.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top;

    const randomAngleX = (Math.random() - 0.5) * 50;
    const endY = -40 - Math.random() * 20;

    textEl.style.setProperty('--target-x', `${randomAngleX}px`);
    textEl.style.setProperty('--target-y', `${endY}px`);
    textEl.style.left = `${startX}px`;
    textEl.style.top = `${startY}px`;

    document.body.appendChild(textEl);

    textEl.addEventListener('animationend', () => {
        textEl.remove();
    });
}

function copySupportCode(buttonEl) {
    const code = buttonEl.textContent.trim();
    showFloatingCopyText(buttonEl);

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).catch(() => {
            fallbackCopy(code);
        });
    } else {
        fallbackCopy(code);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Fallback copy failed:', err);
    }

    document.body.removeChild(textArea);
}

document.addEventListener('DOMContentLoaded', () => {
    const supportBtn = document.getElementById('supportCodeBtn');
    if (supportBtn) {
        supportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            copySupportCode(supportBtn);
        });
    }
});

/* ===================================================
   Initialization
   =================================================== */

// Reads a `?import=` payload sent over from the old staticvacant.github.io
// site (see migrate.js there). Base64-encoded JSON of { obtained, mastered }
// sprite id arrays — ids are validated against this site's own sprite list
// rather than trusting positions/order, since the two sites' sprite data can
// drift out of sync over time.
function decodeMigrationPayload(encoded) {
    try {
        const json = decodeURIComponent(escape(atob(encoded)));
        const data = JSON.parse(json);
        if (!data || !Array.isArray(data.obtained) || !Array.isArray(data.mastered)) return null;
        return data;
    } catch {
        return null;
    }
}

function applyMigrationPayload(data) {
    const validIds = getSpriteIdSet();
    const incomingObtained = uniqueValidIds(data.obtained, validIds);
    const incomingMastered = uniqueValidIds(data.mastered, validIds);

    // Merge rather than overwrite, in case the person already has some
    // progress saved on this site.
    state.obtained = [...new Set([...state.obtained, ...incomingObtained])];
    const obtainedIds = new Set(state.obtained);
    state.mastered = [...new Set([...state.mastered, ...incomingMastered])]
        .filter(id => obtainedIds.has(id));

    saveCollection();
}

async function init() {
    if (typeof baseSprites === 'undefined') {
        console.error('baseSprites is not defined.');
        return;
    }

    await prepareSpriteList();

    const params = new URLSearchParams(location.search);
    const shareCode = params.get('c');
    const migrationCode = params.get('import');

    if (shareCode) {
        state.viewMode = true;
        const decoded = decompressCollection(baseSprites, shareCode);
        state.obtained = decoded.obtained;
        state.mastered = decoded.mastered;
        if (dom.viewBanner) dom.viewBanner.hidden = false;
    } else {
        load();

        if (migrationCode) {
            const payload = decodeMigrationPayload(migrationCode);
            if (payload) {
                applyMigrationPayload(payload);
                toast('Your data was brought over from the old site!', 'success');
            }
            const cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete('import');
            window.history.replaceState({}, '', cleanUrl);
        }
    }

    spriteListInitialized = true;
    populateThemeFilter();
    applyStateToDOM();
    renderGrid();
    bindEvents();
    checkUnredeemedCodes();
    syncSpriteListSettingsUI();
}

init().catch(err => {
    console.error(err);
});