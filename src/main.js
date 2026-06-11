// Bloombine — petal-ring association game.
//
// Model:
//   N petals arranged in a ring (clockwise). Each petal has 4 words, one on each
//   side: top=outer, right, bottom=inner, left. Rotating a petal cycles those
//   words clockwise around the square.
//
//   In the assembled flower, slot k's RIGHT word and slot (k+1)'s LEFT word meet
//   at boundary k. The cluegiver writes one clue word that associates with both
//   boundary words. There are N boundaries (the ring wraps around).
//
//   E "extra" petals are decoys: they carry random words from the same pool but
//   belong in no slot. The player must place each correct petal in the right slot
//   at the right rotation; decoys must remain in the tray.

// UI strings — always English. Only the in-game words follow the selected
// language (LANGS / wordlist).
const STRINGS = {
    title: 'Bloombine',
    subtitle: 'Word associations around the flower',
    petals: 'Petals',
    extras: 'Extra (decoy) petals',
    language: 'Word language',
    start: 'Create game',
    rules: 'Rules',
    rulesText: 'A flower has N petals in a ring. Each petal carries four words — one per edge. Where two petals meet, two of their words touch (the right one of the left petal, the left one of the right petal). The clue-giver writes one word per boundary that associates both. Other players get the shuffled petals (plus a few decoys) and must rotate and place each one so every boundary matches its clue.',
    clueHeader: 'Write a clue for each boundary',
    clueHint: 'one word that links the two words on either side',
    cluePh: 'Type clue here ...',
    clueContains: 'Clue "{c}" contains the word "{w}".',
    play: 'Play',
    copied: 'Link copied!',
    copyFallback: 'Link is in the address bar (hash).',
    playInstr: 'Drag each petal into the matching slot and tap ↻ to rotate, until each boundary\'s two words fit its clue.',
    tray: 'Petals (shuffled)',
    reveal: 'Reveal',
    newRound: 'New game',
    score: '{c} of {t} correct.',
    boundary: 'Boundary',
    slot: 'Slot',
    needAllClues: 'Please fill in every clue.',
    tries: 'Round {c}',
    lockIn: 'Submit',
    exitTitle: 'Exit game?',
    exitMsg: 'Your progress on this flower will be lost.',
    cancel: 'Cancel',
    exit: 'Exit',
    allCorrect: 'All correct!',
};

const LANGS = {
    de: { name: 'Deutsch', key: 'German' },
};
const DEFAULT_LANG = 'de';

const state = {
    lang: DEFAULT_LANG,
    n: 4,        // petals in the ring
    e: 1,        // extra decoy petals
    zoom: 1,     // LAYOUT scale (auto-fit only — re-renders & re-arranges)
    userZoom: 1, // VISUAL scale (manual zoom — CSS zoom, no re-arrange)
    petals: [],  // length n+e; petals[i].id = i; petals 0..n-1 are real (slot i), n..n+e-1 decoys
    clues: [],   // length n; clue at boundary k connects slot k right + slot (k+1)%n left
    placements: {},   // {slotIndex: petalId}    — play mode
    petalRot: {},     // {petalId: rotation 0..3} — play mode (cluegiver mode: always 0)
    palette: [],      // petal-id order in the tray (play mode)
};

// ----- persistent settings (localStorage) -----
const SETTINGS_KEY = 'bloombine.settings.v1';
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3.0;
const ZOOM_STEP = 0.1;
function clampZoom(z) {
    if (!Number.isFinite(z)) return 1;
    // Pure clamp, NO snapping. The +/- button stepper sets userZoom to
    // whatever value makes the EFFECTIVE zoom (userZoom × layoutZoom) hit
    // the 10 % grid — that target is often NOT itself a multiple of 0.1
    // (e.g. 0.9 / 0.8 = 1.125). Snapping here would round it to 1.1 and
    // give effective = 88 % instead of the intended 90 %.
    return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
}
function loadSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return;
        const s = JSON.parse(raw);
        if (Number.isInteger(s.n) && s.n >= 4 && s.n <= 12) state.n = s.n;
        if (Number.isInteger(s.e) && s.e >= 0) state.e = s.e;
        if (typeof s.lang === 'string' && LANGS[s.lang]) state.lang = s.lang;
        if (typeof s.zoom === 'number') state.zoom = clampZoom(s.zoom);
        if (typeof s.userZoom === 'number') state.userZoom = clampZoom(s.userZoom);
    } catch {}
}
function saveSettings() {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({
            n: state.n, e: state.e, lang: state.lang,
            zoom: state.zoom, userZoom: state.userZoom,
        }));
    } catch {}
}

// ----- persistent game state (across reloads) -----
const GAME_STATE_KEY = 'bloombine.gamestate.v1';
function saveGameState() {
    try {
        const screen = document.body.dataset.screen;
        if (screen === 'setup' || !state.petals || !state.petals.length) {
            localStorage.removeItem(GAME_STATE_KEY);
            return;
        }
        const data = {
            screen,
            n: state.n,
            e: state.e || 0,
            lang: state.lang,
            petals: state.petals.map(p => ({ words: p.words })),
            clues: state.clues,
            shuffleSeed: state.shuffleSeed,
            placements: state.placements,
            petalRot: state.petalRot,
            trayPositions: state.trayPositions,
            cardAngles: state.cardAngles,
            locked: state.locked,
            tries: state.tries || 0,
        };
        localStorage.setItem(GAME_STATE_KEY, JSON.stringify(data));
    } catch {}
}
function loadGameState() {
    try {
        const raw = localStorage.getItem(GAME_STATE_KEY);
        if (!raw) return null;
        const d = JSON.parse(raw);
        if (!d || !d.screen || !Array.isArray(d.petals) || !d.petals.length) return null;
        return d;
    } catch { return null; }
}
function restoreGameState(d) {
    state.lang = d.lang || DEFAULT_LANG;
    state.n = d.n;
    state.e = d.e || 0;
    state.petals = d.petals.map((p, i) => ({
        id: i,
        words: (p && p.words) || p,
        rotation: 0,
    }));
    state.clues = (d.clues && d.clues.slice()) || new Array(d.n).fill('');
    state.shuffleSeed = d.shuffleSeed || 1;

    if (d.screen === 'create') {
        renderCreate();
    } else if (d.screen === 'play') {
        state.tries = d.tries || 0;
        renderPlay();
        updateTryCounter();
        // After renderPlay re-shuffles from the seed, overlay the player's
        // actual rotations, tray positions, lock state, and placements at the
        // moment of the last reload.
        const savedRot = d.petalRot || {};
        const savedPos = d.trayPositions || {};
        const savedAng = d.cardAngles || {};
        state.locked = d.locked || {};
        state.cardAngles = {};
        for (let i = 0; i < state.petals.length; i++) {
            const r = savedRot[i];
            if (r != null) {
                state.petals[i].rotation = r;
                state.petalRot[i] = r;
            }
            const card = document.querySelector(`.petal-card[data-petal-id="${i}"]`);
            if (!card) continue;
            window.refreshPetalCard(card, state.petals[i]);
            const pos = savedPos[i];
            if (pos) {
                state.trayPositions[i] = pos;
                card.style.left = pos.x + 'px';
                card.style.top = pos.y + 'px';
            }
            const ang = savedAng[i];
            if (ang) {
                state.cardAngles[i] = ang;
                card.style.transformOrigin = '50% 50%';
                card.style.transform = `rotate(${ang}deg)`;
                card.style.setProperty('--slot-angle', ang + 'deg');
                applyCardAngleFlips(card, ang);
            }
            if (state.locked[i]) applyLockVisual(card, true);
        }
        const savedPl = d.placements || {};
        for (const slotKey of Object.keys(savedPl)) {
            // Pass noShift = true so the saved petal.rotation is preserved
            // exactly (placePetal would otherwise cycle it by rotationShift).
            placePetal(savedPl[slotKey], parseInt(slotKey, 10), undefined, true);
        }
    } else {
        renderSetup();
    }
}

function t(key, vars) {
    let s = STRINGS[key] || key;
    if (vars) for (const k in vars) s = s.replace('{' + k + '}', vars[k]);
    return s;
}

// ----- wordlist (script-embedded; no fetch, works on file://) -----
function wordlistFor(lang) {
    const key = (LANGS[lang] || LANGS[DEFAULT_LANG]).key;
    const pool = (window.WORDLISTS_EMBEDDED || {})[key];
    if (!pool || !pool.length) throw new Error('Keine eingebettete Wortliste für ' + lang);
    return pool;
}

function pickWords(pool, n) {
    const seen = new Set();
    const uniq = [];
    for (const w of pool) {
        const k = w.toLowerCase();
        if (!seen.has(k)) { seen.add(k); uniq.push(w); }
    }
    if (uniq.length < n) throw new Error('Wortliste zu klein: ' + uniq.length + ' < ' + n);
    const a = uniq.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
}

// ----- seeded PRNG for play-mode shuffle so shared links look identical -----
function rng(seed) {
    let t = seed >>> 0;
    return function () {
        t = (t + 0x6D2B79F5) >>> 0;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}
function shuffleSeeded(arr, seed) {
    const a = arr.slice();
    const r = rng(seed);
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ----- URL share encoding -----
// #s=base64(JSON({l, n, e, p:[[w0,w1,w2,w3]...], c:[...], s}))
function encodeState(mode) {
    const m = (mode === 'edit') ? 'edit' : 'play';
    const payload = {
        l: state.lang,
        n: state.n,
        e: state.e,
        p: state.petals.map(p => p.words),
        c: state.clues,
        s: state.shuffleSeed || 1,
    };
    const json = JSON.stringify(payload);
    return '#s=' + btoa(unescape(encodeURIComponent(json))) + '&mode=' + m;
}
function decodeState() {
    const sMatch = location.hash.match(/[#&]s=([A-Za-z0-9+/=_-]+)/);
    if (!sMatch) return null;
    const modeMatch = location.hash.match(/[#&]mode=(play|edit)/);
    const mode = modeMatch ? modeMatch[1] : 'play';
    try {
        const b64 = sMatch[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(escape(atob(b64)));
        const p = JSON.parse(json);
        if (!p || !Array.isArray(p.p) || !Array.isArray(p.c)) return null;
        p.mode = mode;
        return p;
    } catch { return null; }
}

// ----- tiny DOM helpers -----
const root = () => document.getElementById('app-root');
const banner = () => document.getElementById('banner');
function showBanner(msg, isErr) {
    const b = banner();
    b.textContent = msg;
    b.className = 'banner show' + (isErr ? ' error' : '');
    clearTimeout(showBanner._t);
    showBanner._t = setTimeout(() => { b.className = 'banner'; }, 3000);
}
function el(tag, props, ...kids) {
    const e = document.createElement(tag);
    if (props) for (const k in props) {
        if (k === 'class') e.className = props[k];
        else if (k === 'style') e.setAttribute('style', props[k]);
        else if (k.startsWith('on') && typeof props[k] === 'function') e.addEventListener(k.slice(2).toLowerCase(), props[k]);
        else if (k in e) e[k] = props[k];
        else e.setAttribute(k, props[k]);
    }
    for (const c of kids) {
        if (c == null || c === false) continue;
        e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return e;
}

// ----- history-aware navigation -----
// Forward navigation pushes a history entry tagged with the screen so that the
// browser's back button (or the phone navigation-bar back gesture) lands on
// the previous screen, identical to tapping the topbar back arrow.
function navigate(screen) {
    history.pushState({ screen }, '', location.href);
    renderForScreen(screen);
    saveGameState();
}
function renderForScreen(screen) {
    // Strip the play-only chrome before rendering setup (where it doesn't
    // belong). renderCreate and renderPlay manage their own toolbars.
    if (screen === 'setup') {
        document.querySelectorAll('.play-toolbar').forEach((tb) => tb.remove());
    }
    if (screen === 'create') renderCreate();
    else if (screen === 'play') renderPlay();
    else renderSetup();
}
window.addEventListener('popstate', (e) => {
    const screen = (e.state && e.state.screen) || 'setup';
    renderForScreen(screen);
    saveGameState();
});

// Re-render the play screen on viewport resize. The flower-board scales to
// the new size (handles landscape↔portrait transitions), and any petal-card
// not currently in a slot is re-arranged into the new free space (so cards
// can never end up overlapping the board / slots / badges after a resize).
let _resizePending = false;
let _lastResizeSize = { w: 0, h: 0 };
window.addEventListener('resize', () => {
    if (document.body.dataset.screen !== 'play' || _resizePending) return;
    _resizePending = true;
    requestAnimationFrame(() => {
        _resizePending = false;
        if (document.body.dataset.screen !== 'play') return;
        // If the viewport grew on either axis, reset to 100 % zoom so the
        // re-arrangement starts from the largest flower and the auto-fit
        // loop only kicks in if cards still don't fit at full size.
        const appRoot = document.getElementById('app-root');
        if (appRoot) {
            const r2 = appRoot.getBoundingClientRect();
            // Always reset state.zoom to 1 on resize — the extension-first
            // placement loop in renderPlay handles overflow by growing
            // playH instead of shrinking the flower. Zoom only drops if
            // extension truly can't help (rare).
            if (getZoom() !== 1) {
                state.zoom = 1;
                updateZoomButtonsState();
                saveSettings();
            }
            _lastResizeSize = { w: r2.width, h: r2.height };
        }
        // Drop the tray positions for cards that aren't sitting in a slot —
        // those are the cards that need fresh, non-overlapping spots.
        const inSlot = new Set(Object.values(state.placements || {}));
        if (state.trayPositions) {
            Object.keys(state.trayPositions).forEach((k) => {
                if (!inSlot.has(parseInt(k, 10))) delete state.trayPositions[k];
            });
        }
        saveGameState();
        const saved = loadGameState();
        if (saved) restoreGameState(saved);
    });
});

// ----- topbar slots (back-button on the far left, action buttons on the right) -----
function setTopbarActions(...nodes) {
    const slot = document.getElementById('topbar-right');
    if (slot) slot.replaceChildren(...nodes, makeFullscreenButton());
}
// ----- Edge-scroll while dragging a card -----
// When the cursor (during a drag) approaches a viewport edge we scroll
// #app-root in that direction at a speed proportional to how close it is.
// The lifted card is position:fixed so it stays glued to the cursor while
// the world scrolls under it — no extra repositioning needed.
let _edgeScrollRAF = null;
let _edgeScrollVX = 0;
let _edgeScrollVY = 0;
const EDGE_SCROLL_BAND = 80;       // px from a viewport edge that activates scroll
const EDGE_SCROLL_MAX  = 24;       // max px per frame at the very edge
function updateEdgeScroll(clientX, clientY) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let vx = 0, vy = 0;
    if (clientX < EDGE_SCROLL_BAND) {
        vx = -((EDGE_SCROLL_BAND - clientX) / EDGE_SCROLL_BAND) * EDGE_SCROLL_MAX;
    } else if (vw - clientX < EDGE_SCROLL_BAND) {
        vx = ((EDGE_SCROLL_BAND - (vw - clientX)) / EDGE_SCROLL_BAND) * EDGE_SCROLL_MAX;
    }
    if (clientY < EDGE_SCROLL_BAND) {
        vy = -((EDGE_SCROLL_BAND - clientY) / EDGE_SCROLL_BAND) * EDGE_SCROLL_MAX;
    } else if (vh - clientY < EDGE_SCROLL_BAND) {
        vy = ((EDGE_SCROLL_BAND - (vh - clientY)) / EDGE_SCROLL_BAND) * EDGE_SCROLL_MAX;
    }
    _edgeScrollVX = vx;
    _edgeScrollVY = vy;
    if ((vx || vy) && _edgeScrollRAF == null) {
        const tick = () => {
            if (_edgeScrollVX === 0 && _edgeScrollVY === 0) {
                _edgeScrollRAF = null;
                return;
            }
            const root = document.getElementById('app-root');
            if (root) {
                root.scrollLeft += _edgeScrollVX;
                root.scrollTop  += _edgeScrollVY;
            }
            _edgeScrollRAF = requestAnimationFrame(tick);
        };
        _edgeScrollRAF = requestAnimationFrame(tick);
    }
}
function stopEdgeScroll() {
    if (_edgeScrollRAF != null) {
        cancelAnimationFrame(_edgeScrollRAF);
        _edgeScrollRAF = null;
    }
    _edgeScrollVX = _edgeScrollVY = 0;
}
// Toggle between fullscreen and normal. Stays in sync with the actual
// fullscreen state via the 'fullscreenchange' event below (handles
// pressing Esc, the browser-supplied exit button, etc.).
function makeFullscreenButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn icon ghost fullscreen-btn';
    btn.id = 'btn-fullscreen';
    const setIcon = () => {
        const inFs = !!document.fullscreenElement;
        btn.title = inFs ? 'Exit fullscreen' : 'Fullscreen';
        btn.setAttribute('aria-label', btn.title);
        btn.innerHTML = inFs
            ? // exit fullscreen icon — four arrows pointing inward
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
              + 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
              + '<polyline points="9 4 9 9 4 9"/>'
              + '<polyline points="15 4 15 9 20 9"/>'
              + '<polyline points="9 20 9 15 4 15"/>'
              + '<polyline points="15 20 15 15 20 15"/></svg>'
            : // enter fullscreen icon — four arrows pointing outward
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
              + 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
              + '<polyline points="4 9 4 4 9 4"/>'
              + '<polyline points="20 9 20 4 15 4"/>'
              + '<polyline points="4 15 4 20 9 20"/>'
              + '<polyline points="20 15 20 20 15 20"/></svg>';
    };
    setIcon();
    btn.addEventListener('click', async () => {
        try {
            if (document.fullscreenElement) await document.exitFullscreen();
            else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
        } catch (err) {
            showBanner('Fullscreen unavailable: ' + (err && err.message || ''), true);
        }
    });
    return btn;
}
// Refresh ALL fullscreen-buttons (the current topbar one + any rendered
// in previous frames that may still be in the DOM after re-render).
if (typeof document !== 'undefined' && !document._fsListenerBound) {
    document._fsListenerBound = true;
    document.addEventListener('fullscreenchange', () => {
        // Replace the topbar's fullscreen button with a freshly-built one so
        // the icon flips to match the new state.
        const old = document.getElementById('btn-fullscreen');
        if (old && old.parentNode) old.parentNode.replaceChild(makeFullscreenButton(), old);
    });
}
function setTopbarBack(onClick) {
    const slot = document.getElementById('topbar-back');
    if (!slot) return;
    slot.replaceChildren();
    if (typeof onClick !== 'function') return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn icon ghost';
    btn.setAttribute('aria-label', 'Back');
    btn.title = 'Back';
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" '
        + 'stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'
        + '<polyline points="15 18 9 12 15 6"/></svg>';
    btn.addEventListener('click', onClick);
    slot.appendChild(btn);
}

// "Info" popup (lightweight modal, dismissed by overlay click / Escape / close-X).
function openInfoPopup(html) {
    const existing = document.getElementById('info-popup-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'info-popup-overlay';
    overlay.className = 'popup-overlay';
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    const box = document.createElement('div');
    box.className = 'popup-box';
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'popup-close';
    close.setAttribute('aria-label', 'Close');
    close.textContent = '×';
    close.addEventListener('click', () => overlay.remove());
    box.appendChild(close);
    const body = document.createElement('div');
    body.className = 'popup-body';
    body.innerHTML = html;
    box.appendChild(body);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    const onKey = (e) => { if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onKey); } };
    document.addEventListener('keydown', onKey);
}

function makeInfoButton(htmlGetter) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn icon ghost info-btn';
    btn.title = 'How to play';
    btn.setAttribute('aria-label', 'Info');
    // viewBox includes stroke width so the circle is not clipped at the edges.
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" '
        + 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="11"/>'
        + '<circle cx="12" cy="8" r="1.2" fill="currentColor" stroke="none"/></svg>';
    btn.addEventListener('click', () => openInfoPopup(htmlGetter()));
    return btn;
}

function infoForCreate() {
    const extras = state.e || 0;
    return `<h3>Clue-giving phase</h3>
<p>Each green badge sits between two petals — read the two words touching that boundary (the right edge of the left petal and the left edge of the right petal) and write one word that links them both. Your clue may not contain either petal word.</p>

<h3>What happens next</h3>
<ol>
<li>Tap the <strong>share</strong> icon to copy a link other players can open, or hand the device to them.</li>
<li>Tap <strong>${t('play')}</strong> to shuffle the petals (plus ${extras} decoy${extras === 1 ? '' : 's'}) and start the puzzle.</li>
<li>The other players drag each petal into a flower-slot and click it to rotate, until every boundary's two visible words fit your clue.</li>
</ol>`;
}

function infoForPlay() {
    return `<h3>Goal</h3>
<p>Place every petal in the right slot at the right rotation, so each green clue badge sits between the two petal-words it describes.</p>

<h3>Petal mechanics</h3>
<ul>
<li>Each diamond petal has <strong>4 words</strong>, one per edge.</li>
<li>The two top edges of adjacent petals (right edge of the left petal + left edge of the right petal) are what the clue between them refers to.</li>
<li><strong>Drag</strong> a petal onto a flower-slot to place it.</li>
<li><strong>Click</strong> a petal to rotate it 90° clockwise — there is no separate rotate icon.</li>
<li><strong>Right-click</strong> (desktop) or <strong>long-press</strong> (touch) a petal to lock it, so you don't move or rotate it by accident. A padlock appears in the centre. Repeat to unlock.</li>
<li>Some petals are <strong>decoys</strong>: they don't belong in any slot. Leave them outside the flower.</li>
</ul>

<h3>Buttons in the top bar</h3>
<ul>
<li><strong>Lock in</strong> (green) — enabled once every slot is filled. Checks your guess: any petal in the wrong slot OR at the wrong rotation is returned to the play area. The <em>Round</em> counter ticks up.</li>
<li><strong>Reveal</strong> (red) — gives up: the flower solves itself.</li>
<li><strong>Back arrow</strong> — exit the current game (with a confirmation).</li>
<li><strong>Share</strong> — copy the game link so another player can join with the same flower.</li>
</ul>

<h3>Tip</h3>
<p>The bottom-two edges of each petal don't have to match anything — only the top-two edges (the ones facing the clue badges) matter for scoring.</p>`;
}

// Material-design "share" icon (three connected dots forming a "<" shape).
function makeShareIcon() {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('fill', 'currentColor');
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d',
        'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11'
        + 'c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81'
        + 'C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16'
        + 'c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z');
    svg.appendChild(path);
    return svg;
}

// ----- +/- stepper -----
function stepper({ value, min, max, onChange }) {
    // Track the current value in a local closure variable instead of re-parsing
    // textContent. (Re-parsing was the source of "+" sometimes acting like "-"
    // after re-renders: a stale textContent could feed the wrong base value.)
    let cur = Number.isFinite(value) ? value : 0;
    const wrap = el('div', { class: 'stepper' });
    const v = el('span', { class: 'step-value' }, String(cur));
    function update(delta) {
        const n = cur + delta;
        if (min != null && n < min) return;
        if (max != null && n > max) return;
        cur = n;
        v.textContent = String(cur);
        onChange(cur);
    }
    const minus = el('button', { type: 'button', class: 'step-btn', 'aria-label': '−' }, '−');
    const plus = el('button', { type: 'button', class: 'step-btn', 'aria-label': '+' }, '+');
    minus.addEventListener('click', () => update(-1));
    plus.addEventListener('click', () => update(+1));
    wrap.appendChild(minus);
    wrap.appendChild(v);
    wrap.appendChild(plus);
    return wrap;
}

// ----- setup screen -----
function renderSetup() {
    document.body.dataset.screen = 'setup';
    setTopbarActions();
    setTopbarBack(null);
    const r = root();
    r.replaceChildren();

    const card = el('div', { class: 'panel' });
    card.appendChild(el('h1', { class: 'title' }, t('title')));
    card.appendChild(el('p', { class: 'subtitle' }, t('subtitle')));

    const form = el('div', { class: 'form' });

    // petal count
    const pField = el('label', { class: 'field' }, el('span', null, t('petals')));
    pField.appendChild(stepper({
        value: state.n, min: 4, max: 12,
        onChange: (n) => { state.n = n; saveSettings(); },
    }));
    form.appendChild(pField);

    // extra petals
    const eField = el('label', { class: 'field' }, el('span', null, t('extras')));
    eField.appendChild(stepper({
        value: state.e, min: 0, max: null,
        onChange: (n) => { state.e = n; saveSettings(); },
    }));
    form.appendChild(eField);

    // language (currently only de, but UI is in place)
    const lField = el('label', { class: 'field' }, el('span', null, t('language')));
    const sel = el('select', null);
    for (const code in LANGS) {
        const opt = el('option', { value: code }, LANGS[code].name);
        if (code === state.lang) opt.selected = true;
        sel.appendChild(opt);
    }
    sel.addEventListener('change', () => { state.lang = sel.value; saveSettings(); renderSetup(); });
    lField.appendChild(sel);
    form.appendChild(lField);

    card.appendChild(form);

    const go = el('button', {
        class: 'btn primary big',
        onclick: () => {
            try {
                const pool = wordlistFor(state.lang);
                const total = state.n + state.e;
                const wordsFlat = pickWords(pool, total * 4);
                state.petals = [];
                for (let i = 0; i < total; i++) {
                    state.petals.push({
                        id: i,
                        words: wordsFlat.slice(i * 4, i * 4 + 4),
                    });
                }
                state.clues = new Array(state.n).fill('');
                state.placements = {};
                state.petalRot = {};
                state.shuffleSeed = (Math.floor(Math.random() * 2 ** 31)) || 1;
                location.hash = '';
                navigate('create');
            } catch (err) {
                showBanner(String(err.message || err), true);
            }
        },
    }, t('start'));
    card.appendChild(go);

    // ----- game-set management -----
    card.appendChild(el('hr', { class: 'menu-sep' }));
    const menuActions = el('div', { class: 'menu-actions' });
    menuActions.appendChild(el('button', {
        class: 'btn', type: 'button',
        onclick: () => openImportGameModal(),
    }, 'Import game'));
    menuActions.appendChild(el('button', {
        class: 'btn', type: 'button',
        onclick: () => pickJsonFile(importGameSetJson),
    }, 'Import game set'));
    menuActions.appendChild(el('button', {
        class: 'btn', type: 'button',
        onclick: () => exportGameSet(),
    }, 'Export game set'));
    menuActions.appendChild(el('button', {
        class: 'btn', type: 'button',
        onclick: () => openGameSetPicker(),
    }, 'Play specific game'));
    card.appendChild(menuActions);

    const rules = el('div', { class: 'rules' });
    rules.appendChild(el('div', { class: 'rules-title' }, t('rules')));
    rules.appendChild(el('p', null, t('rulesText')));
    card.appendChild(rules);

    r.appendChild(card);
}

// ----- ring geometry helpers -----
// % positioning auto-scales with the container. Clue badges anchor at the
// petal tip (independent of N). The slot ring radius varies per N — see
// window.slotRadius(n) — so SLOT_R_PCT is computed inside renderFlowerBoard.
const CLUE_R_PCT = window.FLOWER_GEOM.PETAL_TIP_R / window.FLOWER_GEOM.VB * 100;

// ----- play-area zoom -----
// Two separate scales:
//   • state.zoom     — LAYOUT scale set by the renderPlay auto-fit loop
//                      (drives flowerSize / cardSize, so changing it
//                      requires a re-render and re-arranges cards).
//   • state.userZoom — VISUAL scale set by manual zoom buttons / pinch /
//                      Ctrl+wheel (applied as CSS zoom on top — no
//                      re-render, no re-arrangement of cards).
// getZoom() returns the LAYOUT scale (used by renderPlay). getUserZoom()
// returns the VISUAL scale (used by setZoom + button labels).
function getZoom()     { return state.zoom     || 1; }
function getUserZoom() { return state.userZoom || 1; }
// Step the EFFECTIVE zoom (= userZoom × layoutZoom) by ±ZOOM_STEP, snapping
// the result to the 10 % grid. Because layoutZoom is fixed (auto-fit set
// it), this is achieved by updating userZoom = nextEffective / layoutZoom.
// A small epsilon shifts the snap so that values like 0.79996 (which
// floating-point math produces for 1.143 × 0.7) still round to 0.8 — not
// 0.7, which would leave the stepper stuck at 80 %.
function stepZoom(direction) {
    // The create screen renders the flower at its natural size — no auto-fit
    // layout zoom — so the effective on-screen scale equals userZoom alone.
    // Using state.zoom (the PLAY-screen auto-fit) here would make each click
    // jump by 1/state.zoom × 10 % (i.e. 50 % when state.zoom=0.2).
    const isCreate = (typeof document !== 'undefined' && document.body.dataset.screen === 'create');
    const layoutZ = isCreate ? 1 : getZoom();
    const curEff  = getUserZoom() * layoutZ;
    const EPS = 1e-3;
    const nextEff = direction > 0
        ? Math.floor(curEff * 10 + EPS) / 10 + ZOOM_STEP
        : Math.ceil(curEff * 10 - EPS) / 10  - ZOOM_STEP;
    setZoom(nextEff / layoutZ);
}
function applyZoom() {
    // (Kept for back-compat with callers; the actual zoom is applied on
    // re-render via flowerSize. Just refresh the button labels.)
    updateZoomButtonsState();
}
function setZoom(z) {
    const prev = getUserZoom();
    const next = clampZoom(z);
    if (next === prev) return;
    state.userZoom = next;
    updateZoomButtonsState();
    saveSettings();
    // Manual zoom = VISUAL CSS scale only. Don't touch state.zoom (the
    // layout scale) and don't re-render — cards keep their positions and
    // just appear bigger/smaller.
    const appRoot = document.getElementById('app-root');
    if (appRoot) appRoot.style.setProperty('--play-zoom', next);
}
// Disable the +/- buttons at the userZoom bounds, and refresh the label
// to the EFFECTIVE scale (userZoom × layoutZoom). The label needs the
// combined value because the auto-fit layout scale also visibly shrinks /
// enlarges the flower.
function updateZoomButtonsState() {
    const uz = getUserZoom();
    // Same screen-awareness as stepZoom — in create the visual scale is
    // just userZoom (no layout-fit multiplier).
    const isCreate = (typeof document !== 'undefined' && document.body.dataset.screen === 'create');
    const eff = isCreate ? uz : (uz * getZoom());
    const out = document.getElementById('btn-zoom-out');
    const inn = document.getElementById('btn-zoom-in');
    const lab = document.getElementById('zoom-label');
    if (out) out.disabled = uz <= ZOOM_MIN + 1e-6;
    if (inn) inn.disabled = uz >= ZOOM_MAX - 1e-6;
    if (lab) lab.textContent = Math.round(eff * 100) + '%';
}

// Compute & write the per-edge text-flip CSS variables onto a card that lives
// OUTSIDE a slot (play-area, or lifted into <body> during drag). When the card
// is in a slot it inherits these from the slot's inline style; outside a slot
// we have to set them explicitly so .petal-word stays parallel to the diamond
// edges and still reads left-to-right at any visual angle.
function applyCardAngleFlips(card, angleDeg) {
    const needs = (base) => {
        let eff = ((angleDeg + base) % 360 + 360) % 360;
        return eff > 90 && eff <= 270;
    };
    const flipMinus = needs(-45) ? 180 : 0;
    const flipPlus  = needs( 45) ? 180 : 0;
    card.style.setProperty('--text-flip-tl', flipMinus + 'deg');
    card.style.setProperty('--text-flip-br', flipMinus + 'deg');
    card.style.setProperty('--text-flip-tr', flipPlus  + 'deg');
    card.style.setProperty('--text-flip-bl', flipPlus  + 'deg');
}

function ringContainerSize() {
    // Comfortable floor on phones so cards stay touch-friendly; 720 ceiling
    // so the create-screen flower doesn't dominate on huge monitors. Also
    // clamp by available VERTICAL room so the flower never pushes #app-root
    // into vertical-scroll territory on shorter viewports.
    //   ROOM_VERTICAL = #app-root top padding (≈19) + flower-board top
    //   margin (≈19). Bottom padding/margin are stripped on the create
    //   screen so we don't reserve anything below.
    const ROOM_VERTICAL = 38;
    const appRoot = document.getElementById('app-root');
    const availH = (appRoot ? appRoot.clientHeight : window.innerHeight) - ROOM_VERTICAL;
    const w = Math.min(window.innerWidth - 40, 720);
    const h = Math.max(280, availH);
    return Math.max(280, Math.min(w, h, 720));
}

// Build a circular flower board: SVG flower as background, HTML slots over each
// petal's diamond zone, HTML clue badges at the boundaries between petals.
function renderFlowerBoard(n, opts = {}) {
    // Caller (renderPlay) computes the maximum size that fits inside its
    // play-area and passes it in; the create screen still defaults to the
    // viewport-driven sizing.
    const size = opts.size || ringContainerSize();
    // The flower-board is sized to exactly cover its clue-badges. A badge sits
    // at PETAL_TIP_R from the flower centre; pad just enough on each axis so
    // its outer edge falls inside the board. X and Y are computed separately
    // — sin/cos for the boundary angles in use mean the top/bottom badges
    // need MUCH less vertical headroom than the side badges need horizontal.
    const BADGE_HALF_W = 88;   // 11 rem max-width / 2
    const BADGE_HALF_H = 22;   // ~2.2 rem min-height / 2 + buffer for 2-line text
    const G = window.FLOWER_GEOM;
    const R = (G.PETAL_TIP_R / G.VB) * size;
    let maxCos = 0, maxSin = 0;
    for (let k = 0; k < n; k++) {
        const ang = ((k + 0.5) / n) * 2 * Math.PI - Math.PI / 2;
        maxCos = Math.max(maxCos, Math.abs(Math.cos(ang)));
        maxSin = Math.max(maxSin, Math.abs(Math.sin(ang)));
    }
    const padX = Math.max(0, Math.ceil(maxCos * R + BADGE_HALF_W - size / 2));
    const padY = Math.max(0, Math.ceil(maxSin * R + BADGE_HALF_H - size / 2));
    const boardW = size + 2 * padX;
    const boardH = size + 2 * padY;
    const board = el('div', {
        class: 'flower-board',
        style: `width:${boardW}px;height:${boardH}px;`,
    });
    // Inner "stage" = the visible flower area. SVG / slots / badges all
    // position themselves as % of this stage so their existing geometry is
    // preserved; the padding ring around it is what gives the badges room to
    // live inside the board's box.
    const stage = el('div', { class: 'flower-stage' });
    stage.style.position = 'absolute';
    stage.style.left = padX + 'px';
    stage.style.top  = padY + 'px';
    stage.style.width  = size + 'px';
    stage.style.height = size + 'px';
    board.appendChild(stage);
    board.dataset.stagePadX = String(padX);
    board.dataset.stagePadY = String(padY);

    // SVG flower illustration as background
    const svg = window.renderFlowerSVG(n);
    svg.classList.add('flower-bg');
    stage.appendChild(svg);

    // slots (positioned over each petal's diamond zone, rotated to match its petal)
    const SLOT_R_PCT = window.slotRadius(n) / window.FLOWER_GEOM.VB * 100;
    const slotDiagPct = window.slotDiagonal(n) / window.FLOWER_GEOM.VB * 100;
    const needsFlip = (slotAngle, baseDeg) => {
        let eff = ((slotAngle + baseDeg) % 360 + 360) % 360;
        return eff > 90 && eff <= 270;
    };
    for (let k = 0; k < n; k++) {
        const ang = (k / n) * 2 * Math.PI - Math.PI / 2;
        const xPct = 50 + Math.cos(ang) * SLOT_R_PCT;
        const yPct = 50 + Math.sin(ang) * SLOT_R_PCT;
        const slotAngleDeg = (k / n) * 360; // 0=top, clockwise; matches the SVG petal's rotate()
        // Per-edge text flip: keep word boxes along the diamond edges (±45°),
        // but flip text 180° when the slot's rotation would otherwise leave
        // it upside-down. tl/br share base -45°, tr/bl share base +45°.
        const flipMinus = needsFlip(slotAngleDeg, -45) ? 180 : 0;
        const flipPlus  = needsFlip(slotAngleDeg,  45) ? 180 : 0;
        const slot = el('div', {
            class: 'flower-slot', 'data-slot': String(k),
            style: `left:${xPct}%;top:${yPct}%;--slot-angle:${slotAngleDeg}deg;--slot-d:${slotDiagPct}%;`
                + `--text-flip-tl:${flipMinus}deg;--text-flip-br:${flipMinus}deg;`
                + `--text-flip-tr:${flipPlus}deg;--text-flip-bl:${flipPlus}deg;`,
        });
        const drop = el('div', { class: 'slot-drop' });
        slot.appendChild(drop);
        slot.appendChild(el('div', { class: 'slot-label' }, '#' + (k + 1)));
        stage.appendChild(slot);

        // Slot drop is now handled by the card's mouseup (via elementFromPoint),
        // so no per-slot drop/dragover handlers are needed.
    }

    // clue badges (boundary k between slot k and slot k+1).
    // Anchor = midpoint of badge's edge facing the flower, at the petal-tip radius.
    // For upper-half boundaries the inner edge is the BOTTOM (badge dangles up);
    // for lower-half boundaries we flip so the inner edge is the TOP (dangles down).
    // Either way the text inside stays upright, reading left-to-right.
    for (let k = 0; k < n; k++) {
        const ang = ((k + 0.5) / n) * 2 * Math.PI - Math.PI / 2;
        const xPct = 50 + Math.cos(ang) * CLUE_R_PCT;
        const yPct = 50 + Math.sin(ang) * CLUE_R_PCT;
        const boundaryAngleDeg = ((k + 0.5) / n) * 360;
        const norm = ((boundaryAngleDeg % 360) + 360) % 360;
        const flipped = norm > 90 && norm <= 270;
        // For lower-half boundaries, rotate by (angle − 180) so text reads
        // upright along the SAME boundary axis. The previous (180 − angle)
        // formula mirrored the rotation instead — badges on opposite sides
        // of the flower ended up tilted in the wrong direction.
        const cssAngle = flipped ? (boundaryAngleDeg - 180) : boundaryAngleDeg;
        const badge = el('div', {
            class: 'clue-badge' + (flipped ? ' flipped' : ''),
            'data-boundary': String(k),
            style: `left:${xPct}%;top:${yPct}%;--boundary-angle:${cssAngle}deg;`,
        });
        badge.appendChild(el('div', { class: 'clue-label' }, t('boundary') + ' ' + (k + 1)));
        if (opts.clueInput) {
            const inp = el('input', { type: 'text', class: 'clue-text-input', placeholder: t('cluePh'), value: state.clues[k] || '' });
            inp.addEventListener('input', () => {
                state.clues[k] = inp.value;
                inp.classList.remove('invalid');
                updatePlayButtonState();
                saveGameState();
            });
            // Enter / Tab advance focus to the next badge's input (wraps).
            // Tab already works by default when the DOM order matches the
            // boundary order, but we override to guarantee wrap and to keep
            // Shift+Tab going backwards consistently.
            inp.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter' && e.key !== 'Tab') return;
                e.preventDefault();
                const dir = (e.key === 'Tab' && e.shiftKey) ? -1 : 1;
                const total = state.n;
                const nextK = ((k + dir) % total + total) % total;
                const sel = `.clue-badge[data-boundary="${nextK}"] .clue-text-input`;
                const next = document.querySelector(sel);
                if (next) { next.focus(); next.select && next.select(); }
            });
            badge.appendChild(inp);
        } else {
            badge.appendChild(el('div', { class: 'clue-text' }, state.clues[k] || ''));
        }
        stage.appendChild(badge);
    }

    return board;
}

// ----- cluegiver screen -----
function renderCreate() {
    document.body.dataset.screen = 'create';
    // Back: clear any share-URL hash and go to the setup screen explicitly.
    setTopbarBack(() => {
        if (location.hash) {
            history.replaceState({ screen: 'setup' }, '',
                location.pathname + location.search);
        }
        navigate('setup');
    });
    const r = root();
    r.replaceChildren();

    // Zoom toolbar (same row pattern as play screen, but with only the
    // zoom controls — no round counter). Lives outside #app-root in body
    // so it isn't affected by the board's CSS zoom.
    document.querySelectorAll('.play-toolbar').forEach((tb) => tb.remove());
    const zoomOutBtn = el('button', {
        class: 'btn icon zoom-btn', id: 'btn-zoom-out', title: 'Zoom out',
        onclick: () => stepZoom(-1),
    });
    zoomOutBtn.innerHTML = ''
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
        + 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<circle cx="11" cy="11" r="7"/>'
        + '<line x1="20.5" y1="20.5" x2="16" y2="16"/>'
        + '<line x1="7.5" y1="11" x2="14.5" y2="11"/></svg>';
    const zoomInBtn = el('button', {
        class: 'btn icon zoom-btn', id: 'btn-zoom-in', title: 'Zoom in',
        onclick: () => stepZoom(+1),
    });
    zoomInBtn.innerHTML = ''
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
        + 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<circle cx="11" cy="11" r="7"/>'
        + '<line x1="20.5" y1="20.5" x2="16" y2="16"/>'
        + '<line x1="7.5" y1="11" x2="14.5" y2="11"/>'
        + '<line x1="11" y1="7.5" x2="11" y2="14.5"/></svg>';
    const zoomLabel = el('div', { class: 'zoom-label', id: 'zoom-label' },
        Math.round(getUserZoom() * getZoom() * 100) + '%');
    const zoomCtrls = el('div', { class: 'zoom-controls' }, zoomOutBtn, zoomLabel, zoomInBtn);
    // Centred Simple-dialog button — opens a focused view of one boundary's
    // pair of cards with a single input for that boundary's clue.
    const simpleBtn = el('button', {
        class: 'btn simple-dialog-btn',
        type: 'button',
        onclick: () => openSimpleDialog(0),
    }, 'Simple dialog');
    const playBar = el('div', { class: 'play-toolbar' }, simpleBtn, zoomCtrls);
    document.body.insertBefore(playBar, r);
    updateZoomButtonsState();

    // Board with cluegiver-mode inputs at each boundary, petals placed at their correct slots.
    const board = renderFlowerBoard(state.n, { clueInput: true });
    r.appendChild(board);
    // Reflect the user's MANUAL zoom (userZoom) on #app-root so the board
    // (its child) scales with it. state.zoom is the auto-fit layout scale,
    // not the CSS visual scale.
    r.style.setProperty('--play-zoom', getUserZoom());

    // Drop real petals (id 0..n-1) into their slots, rotation 0
    for (let k = 0; k < state.n; k++) {
        const slot = board.querySelector(`.flower-slot[data-slot="${k}"] .slot-drop`);
        const petal = state.petals[k];
        petal.rotation = 0;
        slot.appendChild(window.renderPetalCard(petal, { interactive: false, levelN: state.n }));
    }

    // Decoy petals still exist in state (sampled at draw time) but the cluegiver
    // never sees them — they only show up shuffled into the play-mode tray.
    for (let i = state.n; i < state.n + state.e; i++) state.petals[i].rotation = 0;

    requestAnimationFrame(() => window.fitAllPetalWords(r));

    // Topbar actions: info popup, Google-style share icon, Play button.
    const infoBtn = makeInfoButton(infoForCreate);
    const shareBtn = makeShareButton({ requireCommit: true });
    const saveBtn = el('button', {
        class: 'btn primary',
        id: 'btn-save',
        title: 'Save to game set',
        style: 'background:#1e4d29;border-color:#133018;color:#fff;',
        // Save bypasses commit()'s clue validation — partial games are fine
        // in the set. The added game's Play button is greyed in the picker
        // until the user finishes the clues.
        onclick: () => {
            state.clues = state.clues.map((c) => (c || '').trim());
            const added = addToGameSet(gamePayload());
            showBanner(added ? 'Game saved to set' : 'Game already in set');
            navigate('setup');
        },
    }, 'Save');
    const playBtn = el('button', {
        class: 'btn primary',
        id: 'btn-play',
        style: 'background:#1e4d29;border-color:#133018;color:#fff;',
        onclick: () => commit(() => navigate('play')),
    }, t('play'));
    setTopbarActions(infoBtn, shareBtn, saveBtn, playBtn);
    updatePlayButtonState();
}

// Build the Google-style share icon button.
// requireCommit: validate clue inputs first (cluegiver mode); play mode skips it.
function makeShareButton({ requireCommit }) {
    const btn = el('button', {
        class: 'btn icon ghost share-btn',
        id: 'btn-share',
        title: 'Share',
        'aria-label': 'Share',
        onclick: () => {
            const doShare = () => {
                // Share URL carries the mode so the recipient lands on the
                // right screen: play screen by default (most common share),
                // create screen when sharing from the cluegiver view.
                const hash = encodeState(requireCommit ? 'edit' : 'play');
                location.hash = hash;
                openShareModal(hash);
            };
            requireCommit ? commit(doShare) : doShare();
        },
    });
    btn.appendChild(makeShareIcon());
    return btn;
}

// Modal that exposes the game ID and full URL with one-tap copy buttons.
function openShareModal(hash) {
    const existing = document.getElementById('info-popup-overlay');
    if (existing) existing.remove();

    const gameId = hash.replace(/^[#&]?s=/, '');
    const fullUrl = location.origin + location.pathname + hash;

    const overlay = el('div', { class: 'popup-overlay', id: 'info-popup-overlay' });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    const box = el('div', { class: 'popup-box', style: 'max-width: 560px;' });
    const close = el('button', { class: 'popup-close', 'aria-label': 'Close',
        onclick: () => overlay.remove() }, '×');
    box.appendChild(close);

    const body = el('div', { class: 'popup-body' });
    body.appendChild(el('h3', null, 'Share this game'));
    body.appendChild(el('p', null,
        'Send the URL to a friend so they can open the same flower. Or copy just the game ID and paste it into an existing Bloombine page.'));
    body.appendChild(makeCopyField('Game URL', fullUrl));
    body.appendChild(makeCopyField('Game ID',  gameId));

    // Download the current game as a JSON file (same payload format used
    // by Import game / Import game set).
    const dlActions = el('div', { class: 'popup-actions share-download-row' });
    dlActions.appendChild(el('button', {
        class: 'btn primary', type: 'button',
        onclick: () => {
            const payload = gamePayload();
            const fn = 'bloombine-game-' + (payload.s || 'game') + '.json';
            downloadJson(fn, JSON.stringify(payload, null, 2));
        },
    }, 'Download JSON'));
    body.appendChild(dlActions);

    box.appendChild(body);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    const onKey = (e) => { if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onKey); } };
    document.addEventListener('keydown', onKey);
}

function makeCopyField(label, value) {
    const wrap = el('div', { class: 'copy-field' });
    wrap.appendChild(el('div', { class: 'copy-label' }, label));
    const row = el('div', { class: 'copy-row' });
    // Plain selectable text — no <input>. Clicking selects the whole text so
    // the user can also copy via keyboard.
    const text = el('div', { class: 'copy-text', title: value }, value);
    text.addEventListener('click', () => {
        const r = document.createRange();
        r.selectNodeContents(text);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
    });
    const btn = el('button', {
        class: 'btn icon copy-btn', title: 'Copy', 'aria-label': 'Copy',
        onclick: () => {
            const ok = tryCopy(value);
            showBanner(ok ? t('copied') : t('copyFallback'));
        },
    });
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
        + 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<rect x="9" y="9" width="13" height="13" rx="2"/>'
        + '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    row.appendChild(text);
    row.appendChild(btn);
    // Web-Share-API button — invokes the platform share sheet (mobile +
    // some desktop browsers). Hidden when navigator.share isn't available
    // so we don't show a dead button on plain desktop Chromium / Firefox.
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        const shareBtn = el('button', {
            class: 'btn icon share-native-btn', title: 'Share', 'aria-label': 'Share',
            onclick: async () => {
                try {
                    await navigator.share({ title: 'Bloombine', text: label, url: value });
                } catch (err) {
                    // AbortError = user dismissed the sheet; stay silent.
                    if (err && err.name !== 'AbortError') {
                        showBanner('Share failed: ' + err.message, true);
                    }
                }
            },
        });
        shareBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            + 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
            + '<circle cx="18" cy="5"  r="3"/>'
            + '<circle cx="6"  cy="12" r="3"/>'
            + '<circle cx="18" cy="19" r="3"/>'
            + '<line x1="8.6"  y1="13.5" x2="15.4" y2="17.5"/>'
            + '<line x1="15.4" y1="6.5"  x2="8.6"  y2="10.5"/></svg>';
        row.appendChild(shareBtn);
    }
    wrap.appendChild(row);
    return wrap;
}

function updatePlayButtonState() {
    const allFilled = state.clues.length > 0
        && state.clues.every(c => (c || '').trim() !== '');
    // Save is always enabled — partial games are allowed in the set.
    // Play / Share still need a fully-filled board.
    for (const id of ['btn-play', 'btn-share']) {
        const b = document.getElementById(id);
        if (b) b.disabled = !allFilled;
    }
}

function commit(then) {
    state.clues = state.clues.map(c => (c || '').trim());
    const inputs = Array.from(document.querySelectorAll('.clue-text-input'));
    let ok = true;
    for (let k = 0; k < state.clues.length; k++) {
        const v = state.clues[k];
        const input = inputs[k];
        if (!v) {
            ok = false;
            if (input) input.classList.add('invalid');
            continue;
        }
        const vLow = v.toLowerCase();
        let bad = null;
        // Forbid the clue from containing either boundary word.
        const p1 = state.petals[k];
        const p2 = state.petals[(k + 1) % state.n];
        const candidates = [p1.words[1], p2.words[3]];
        for (const w of candidates) {
            const wLow = (w || '').toLowerCase();
            if (!wLow) continue;
            // Only flag when the CLUE contains the petal WORD (e.g. clue
             // "Sonnenstrahl" contains word "Sonne"). The reverse check used
             // to flag false positives — e.g. word "Himmel" trivially contains
             // a one-letter clue "e".
            if (vLow.includes(wLow)) { bad = w; break; }
        }
        if (bad) {
            ok = false;
            if (input) input.classList.add('invalid');
            showBanner(t('clueContains', { c: v, w: bad }), true);
            return;
        }
    }
    if (!ok) { showBanner(t('needAllClues'), true); return; }
    // A successfully committed game joins the player's game-set.
    addToGameSet(gamePayload());
    then();
}

// ----- game set (collection of committed games) -----
const GAME_SET_KEY = 'bloombine.gameSet.v1';
function loadGameSet() {
    try {
        const raw = localStorage.getItem(GAME_SET_KEY);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
    } catch { return []; }
}
function saveGameSet(arr) {
    try { localStorage.setItem(GAME_SET_KEY, JSON.stringify(arr)); } catch {}
}
function gamePayload() {
    return {
        l: state.lang,
        n: state.n,
        e: state.e,
        p: state.petals.map(p => p.words),
        c: state.clues,
        s: state.shuffleSeed || 1,
    };
}
function gameKey(g) {
    return JSON.stringify([g.l, g.n, g.s, g.p, g.c]);
}
function addToGameSet(g) {
    const set = loadGameSet();
    const key = gameKey(g);
    if (set.some((x) => gameKey(x) === key)) return false;
    set.push(g);
    saveGameSet(set);
    return true;
}
// Per-game completion flag. Keyed by gameKey(), so it survives across
// game-set imports as long as the same game (same lang/n/seed/words/clues)
// is in the set.
const GAME_DONE_KEY = 'bloombine.gamesDone.v1';
function loadDoneSet() {
    try {
        const raw = localStorage.getItem(GAME_DONE_KEY);
        if (!raw) return {};
        const o = JSON.parse(raw);
        return (o && typeof o === 'object') ? o : {};
    } catch { return {}; }
}
function saveDoneSet(o) {
    try { localStorage.setItem(GAME_DONE_KEY, JSON.stringify(o)); } catch {}
}
function markGameDone(g) {
    const o = loadDoneSet();
    o[gameKey(g)] = true;
    saveDoneSet(o);
}
function isGameDone(g) {
    return !!loadDoneSet()[gameKey(g)];
}
function validateGamePayload(g) {
    return !!(g && Number.isInteger(g.n) && g.n >= 2 &&
              Array.isArray(g.p) && Array.isArray(g.c));
}
function importSingleGameJson(text) {
    try {
        const obj = parseGameText(text);
        if (!validateGamePayload(obj)) throw new Error('Invalid game data');
        if (addToGameSet(obj)) showBanner('Game added to set');
        else showBanner('Game already in set');
    } catch (err) { showBanner('Import failed: ' + err.message, true); }
}
// Accepts either:
//   - already-decoded JSON ({ l, n, e, p, c, s, … }),
//   - a full share URL ("…#s=<base64>&mode=…"),
//   - or just the bare base64 game-id payload from a share URL.
function parseGameText(raw) {
    const s = String(raw || '').trim();
    if (!s) throw new Error('Empty input');
    // 1) Plain JSON?
    if (s[0] === '{' || s[0] === '[') {
        return JSON.parse(s);
    }
    // 2) URL with a #s= fragment? extract the base64 part.
    const m = s.match(/[#&?]s=([A-Za-z0-9+/=_-]+)/);
    const b64 = m ? m[1] : s.replace(/[#&].*/, '');
    const norm = b64.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(norm)));
    return JSON.parse(json);
}
function importGameSetJson(text) {
    try {
        const arr = JSON.parse(text);
        if (!Array.isArray(arr)) throw new Error('Expected an array');
        const valid = arr.filter(validateGamePayload);
        saveGameSet(valid);
        showBanner('Game set imported (' + valid.length + ' games)');
    } catch (err) { showBanner('Import failed: ' + err.message, true); }
}
function exportGameSet() {
    const set = loadGameSet();
    if (set.length === 0) { showBanner('Game set is empty'); return; }
    const json = JSON.stringify(set, null, 2);
    downloadJson('bloombine-game-set.json', json);
}
function downloadJson(filename, json) {
    try {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) { showBanner('Download failed: ' + err.message, true); }
}
function pickJsonFile(callback) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => callback(String(reader.result || ''));
        reader.readAsText(file);
    });
    input.click();
}
function playGameFromPayload(g) {
    state.lang = g.l || DEFAULT_LANG;
    state.n = g.n;
    state.e = g.e || 0;
    state.petals = g.p.map((words, i) => ({ id: i, words: words.slice(), rotation: 0 }));
    state.clues = g.c.slice();
    state.shuffleSeed = g.s || 1;
    state.placements = {};
    state.trayPositions = {};
    state.tries = 0;
    location.hash = '';
    navigate('play');
}
// Same as playGameFromPayload but drops the user into the create (cluegiver)
// screen so they can tweak words / clues. The game-set list's Edit icon uses
// this; the user saves changes back via the create-screen Save button.
function editGameFromPayload(g) {
    state.lang = g.l || DEFAULT_LANG;
    state.n = g.n;
    state.e = g.e || 0;
    state.petals = g.p.map((words, i) => ({ id: i, words: words.slice(), rotation: 0 }));
    state.clues = g.c.slice();
    state.shuffleSeed = g.s || 1;
    state.placements = {};
    state.trayPositions = {};
    state.tries = 0;
    location.hash = '';
    navigate('create');
}
// Modal for "Import game" — textarea for pasting (a share-URL base64 game
// id, a full share URL, or already-decoded JSON) plus a "Choose file"
// button as an alternative.
function openImportGameModal() {
    const existing = document.getElementById('import-game-overlay');
    if (existing) existing.remove();
    const overlay = el('div', { id: 'import-game-overlay', class: 'popup-overlay' });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    const box = el('div', { class: 'popup-box', style: 'max-width:520px;padding:1.2rem 1.4rem 1.4rem;' });
    const close = el('button', {
        type: 'button', class: 'popup-close',
        'aria-label': 'Close',
        onclick: () => overlay.remove(),
    }, '×');
    box.appendChild(close);
    const body = el('div', { class: 'popup-body' });
    body.appendChild(el('h3', null, 'Import game'));
    body.appendChild(el('p', null, 'Paste a game id (base64), a share URL, or decoded JSON — or pick a JSON file.'));
    const ta = el('textarea', {
        class: 'import-game-textarea',
        rows: '6',
        placeholder: 'Paste game id, share URL, or JSON…',
    });
    body.appendChild(ta);
    const actions = el('div', { class: 'popup-actions' });
    actions.appendChild(el('button', {
        class: 'btn', type: 'button',
        onclick: () => pickJsonFile((txt) => { importSingleGameJson(txt); overlay.remove(); }),
    }, 'Choose file'));
    actions.appendChild(el('button', {
        class: 'btn', type: 'button',
        onclick: () => overlay.remove(),
    }, t('cancel') || 'Cancel'));
    actions.appendChild(el('button', {
        class: 'btn primary', type: 'button',
        onclick: () => {
            const txt = ta.value.trim();
            if (!txt) { showBanner('Paste game text or choose a file', true); return; }
            importSingleGameJson(txt);
            overlay.remove();
        },
    }, 'Import'));
    body.appendChild(actions);
    box.appendChild(body);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    setTimeout(() => ta.focus(), 50);
}

function openGameSetPicker() {
    const set = loadGameSet();
    const existing = document.getElementById('game-set-overlay');
    if (existing) existing.remove();
    const overlay = el('div', { id: 'game-set-overlay', class: 'popup-overlay' });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    const box = el('div', { class: 'popup-box', style: 'max-width:820px;width:95vw;padding:1.2rem 1.4rem 1.4rem;' });
    const close = el('button', {
        type: 'button', class: 'popup-close',
        'aria-label': 'Close',
        onclick: () => overlay.remove(),
    }, '×');
    box.appendChild(close);
    const body = el('div', { class: 'popup-body' });
    // Title row: heading + a small Reset button that wipes the entire
    // game-set (after confirmation).
    const resetBtn = el('button', {
        type: 'button', class: 'btn',
        style: 'padding:0.15rem 0.5rem;font-size:0.75rem;',
        title: 'Clear the entire game set',
        onclick: () => {
            if (!confirm('Reset the game set? All saved games will be removed.')) return;
            saveGameSet([]);
            overlay.remove();
            openGameSetPicker();
        },
    }, 'Reset');
    const titleRow = el('div', {
        style: 'display:flex;align-items:center;gap:0.6rem;',
    }, el('h3', { style: 'margin:0;' }, 'Play specific game'), resetBtn);
    body.appendChild(titleRow);
    if (set.length === 0) {
        body.appendChild(el('p', null, 'No games in set yet. Start a game from the main menu to add one.'));
    } else {
        const list = el('div', { class: 'game-set-list' });
        const playRandomUnplayed = () => {
            const pool = set.filter((g) => !isGameDone(g));
            if (pool.length === 0) {
                showBanner('No unplayed games left in the set');
                return;
            }
            const pick = pool[Math.floor(Math.random() * pool.length)];
            overlay.remove();
            playGameFromPayload(pick);
        };
        set.forEach((g, idx) => {
            const done = isGameDone(g);
            const item = el('div', { class: 'game-set-item' + (done ? ' done' : '') });
            const lang = (g.l || '').toString().toUpperCase() || '?';
            const label = (idx + 1) + '. ' + lang +
                ' - ' + (g.n || '?') + ' petals' +
                ' - id: ' + (g.s || '?');
            item.appendChild(el('span', { class: 'game-set-item-label' }, label));
            // Checkmark column — always rendered (empty when not done) so
            // the trailing buttons line up across every row.
            item.appendChild(el('span', { class: 'game-set-check' },
                done ? '✓' : ''));
            const cluesComplete = Array.isArray(g.c) && g.c.length === g.n
                && g.c.every((c) => (c || '').trim() !== '');
            const playBtn = el('button', {
                class: 'btn primary', type: 'button',
                disabled: !cluesComplete,
                title: cluesComplete ? '' : 'Game has missing clues — edit to fill them in',
                onclick: () => { overlay.remove(); playGameFromPayload(g); },
            }, 'Play');
            const editBtn = el('button', {
                class: 'btn', type: 'button',
                title: 'Edit in create screen',
                onclick: () => { overlay.remove(); editGameFromPayload(g); },
            }, 'Edit');
            const delBtn = el('button', {
                class: 'btn danger', type: 'button',
                onclick: () => {
                    const cur = loadGameSet();
                    cur.splice(idx, 1);
                    saveGameSet(cur);
                    overlay.remove();
                    openGameSetPicker();
                },
            }, 'Delete');
            const actions = el('div', { class: 'game-set-row-actions' },
                playBtn, editBtn, delBtn);
            item.appendChild(actions);
            list.appendChild(item);
        });
        body.appendChild(list);
        // Bottom action: play a random unplayed game from the set. Disabled
        // when every game in the set is already marked done.
        const hasUnplayed = set.some((g) => !isGameDone(g));
        const actions = el('div', { class: 'popup-actions game-set-actions' });
        const randBtn = el('button', {
            class: 'btn primary', type: 'button',
            onclick: playRandomUnplayed,
        }, 'Play random unplayed game');
        if (!hasUnplayed) randBtn.disabled = true;
        actions.appendChild(randBtn);
        body.appendChild(actions);
    }
    box.appendChild(body);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

// ----- play screen -----
// Card size in CSS px is computed at render time so it matches the actual
// slot-decoration size (which depends on N and on viewport). The value is
// stored in state.cardSize and used everywhere state.cardSize used to be.
const TRAY_GAP = 14;

function renderPlay() {
    document.body.dataset.screen = 'play';
    // Exit: clear the share-URL hash so the next render doesn't reload the
    // game from it, then navigate explicitly to the setup screen.
    setTopbarBack(() => confirmExit(() => {
        if (location.hash) {
            history.replaceState({ screen: 'setup' }, '',
                location.pathname + location.search);
        }
        navigate('setup');
    }));
    const r = root();
    r.replaceChildren();
    state.placements = {};
    state.trayPositions = {}; // reset; restoreGameState overlays saved values later.
    state.tries = state.tries || 0;

    // Randomize each petal's starting rotation + tray order using the seed.
    const total = state.petals.length;
    const seed = state.shuffleSeed || 1;
    const rotR = rng(seed ^ 0x9E3779B1);
    state.petalRot = {};
    for (let i = 0; i < total; i++) {
        state.petalRot[i] = Math.floor(rotR() * 4);
        state.petals[i].rotation = state.petalRot[i];
    }
    state.palette = shuffleSeeded(state.petals.map(p => p.id), seed);

    const lockInBtn = el('button', {
        class: 'btn primary', id: 'btn-lockin',
        onclick: () => lockInGuess(),
    }, t('lockIn'));
    const revealBtn = el('button', {
        class: 'btn danger', id: 'btn-reveal',
        onclick: () => doReveal(),
    }, t('reveal'));
    setTopbarActions(
        makeInfoButton(infoForPlay),
        makeShareButton({ requireCommit: false }),
        lockInBtn,
        revealBtn,
    );

    // Toolbar pinned below the topbar: round counter (centred) + zoom
    // controls (right-aligned), on the same horizontal line.
    const tryEl = el('div', { class: 'try-counter', id: 'try-counter' },
        t('tries', { c: (state.tries || 0) + 1 }));
    const zoomOutBtn = el('button', {
        class: 'btn icon zoom-btn', id: 'btn-zoom-out', title: 'Zoom out',
        onclick: () => stepZoom(-1),
    });
    zoomOutBtn.innerHTML = ''
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
        + 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<circle cx="11" cy="11" r="7"/>'
        + '<line x1="20.5" y1="20.5" x2="16" y2="16"/>'
        + '<line x1="7.5" y1="11" x2="14.5" y2="11"/></svg>';
    const zoomInBtn = el('button', {
        class: 'btn icon zoom-btn', id: 'btn-zoom-in', title: 'Zoom in',
        onclick: () => stepZoom(+1),
    });
    zoomInBtn.innerHTML = ''
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
        + 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<circle cx="11" cy="11" r="7"/>'
        + '<line x1="20.5" y1="20.5" x2="16" y2="16"/>'
        + '<line x1="7.5" y1="11" x2="14.5" y2="11"/>'
        + '<line x1="11" y1="7.5" x2="11" y2="14.5"/></svg>';
    const zoomLabel = el('div', { class: 'zoom-label', id: 'zoom-label' },
        Math.round(getUserZoom() * getZoom() * 100) + '%');
    const zoomCtrls = el('div', { class: 'zoom-controls' }, zoomOutBtn, zoomLabel, zoomInBtn);
    // Toolbar lives OUTSIDE #app-root, directly under #topbar. That way it is
    // unaffected by the play-area's CSS zoom and by any horizontal scroll on
    // #app-root — it always spans the full viewport.
    document.querySelectorAll('.play-toolbar').forEach((tb) => tb.remove());
    const playBar = el('div', { class: 'play-toolbar' }, tryEl, zoomCtrls);
    document.body.insertBefore(playBar, r);
    // Sync the buttons' initial disabled state with the current zoom level.
    updateZoomButtonsState();

    // 100 % zoom = the largest flower-board that fits in the visible playable
    // area (= #app-root minus the sticky toolbar). At lower zoom the flower
    // AND the cards shrink proportionally (in layout pixels, not CSS zoom),
    // freeing up room for more cards to fit on screen without scrolling.
    const G = window.FLOWER_GEOM;
    const BADGE_HALF_W = 88, BADGE_HALF_H = 22;
    const sd = window.slotDiagonal(state.n) / G.VB;
    const appRect = r.getBoundingClientRect();
    const usableW = Math.max(240, appRect.width);
    const usableH = Math.max(240, appRect.height);
    // In PORTRAIT (height > width) the user wants the flower-stage itself
    // to fill the full screen width at 100 % zoom — clue-badges may
    // overflow horizontally beyond the visible viewport. In landscape we
    // keep the badge headroom so the whole board (badges included) fits.
    const isPortrait = usableW < usableH;
    const fitMax = isPortrait
        ? Math.min(usableW, usableH - 2 * BADGE_HALF_H)
        : Math.min(usableW - 2 * BADGE_HALF_W, usableH - 2 * BADGE_HALF_H);
    // flowerSize / cardSize SCALE with state.zoom: at lower zoom the cards
    // are smaller in LAYOUT, so the center-outward algorithm has more room
    // to place them. If not all cards fit at the current zoom, the
    // auto-fit at the bottom of this function reduces state.zoom by 10 %
    // and re-runs the whole render, repeating until everything fits.
    let flowerSize = Math.max(120, fitMax * getZoom());
    state.cardSize = sd * flowerSize;

    // Build the board first so we know its exact (boardW × boardH) — those
    // become the play-area's dimensions (play-area = flower-board).
    const board = renderFlowerBoard(state.n, {
        clueInput: false,
        onSlotDrop: (slotIdx, petalId) => placePetal(petalId, slotIdx),
        size: flowerSize,
    });
    const stagePadX = parseFloat(board.dataset.stagePadX) || 0;
    const stagePadY = parseFloat(board.dataset.stagePadY) || 0;
    const boardW = flowerSize + 2 * stagePadX;
    const boardH = flowerSize + 2 * stagePadY;

    // Play-area = the visible playable rect (= #app-root minus the toolbar).
    // Flower-board sits at top-centre (directly below the toolbar) and takes
    // its full height; the surrounding free space (sides in landscape, below
    // in portrait) is where the petal-cards are laid out.
    const playW = usableW;
    const playH = usableH;
    const playArea = el('div', { class: 'play-area', id: 'play-area' });
    playArea.style.width  = playW + 'px';
    playArea.style.height = playH + 'px';
    // --badge-scale scales clue-badge dimensions with the flower. The
    // 1.0 multiplier matches the rem-based defaults; bigger values (1.5)
    // overflowed the play screen visibly.
    playArea.style.setProperty('--badge-scale', (flowerSize / G.VB).toFixed(3));
    r.appendChild(playArea);
    // CSS --play-zoom carries the manual VISUAL zoom (userZoom) on top of
    // the auto-fit layout. state.zoom (the layout scale) is already baked
    // into flowerSize/cardSize above — userZoom just visually scales
    // without re-arranging anything.
    r.style.setProperty('--play-zoom', getUserZoom());

    // Flower-board flush against play-area top, horizontally centred.
    const boardLeft = Math.max(0, (playW - boardW) / 2);
    const boardTop  = 0;
    board.style.position = 'absolute';
    board.style.left = boardLeft + 'px';
    board.style.top  = boardTop + 'px';
    playArea.appendChild(board);

    // Default card positions: walk a dense grid covering the WHOLE play-area
    // (cards can sit on top of the flower-board's empty edges) and skip any
    // grid cell that would overlap (a) a slot, (b) a clue-badge, (c) any
    // card that is already placed (either from state.trayPositions or just
    // computed in this same pass). Side columns are scanned first so cards
    // prefer the left/right of the flower-board.
    const rectsOverlap = (a, b) =>
        !(a.x + a.w <= b.x || b.x + b.w <= a.x ||
          a.y + a.h <= b.y || b.y + b.h <= a.y);
    const cardRectAt = (x, y) => ({ x, y, w: state.cardSize, h: state.cardSize });

    // Obstacles list seeded with slots and clue-badges (play-area-local
    // coords). DOM elements inside .play-area are scaled by CSS zoom
    // (--play-zoom = userZoom). state.zoom (the layout scale) is already
    // baked into flowerSize/cardSize, so it does NOT appear as a CSS scale
    // on the DOM — we must divide bounding rects by USER zoom only.
    const playRect = playArea.getBoundingClientRect();
    const z = getUserZoom() || 1;
    const obstacles = [];
    playArea.querySelectorAll('.flower-slot').forEach((el) => {
        const r = el.getBoundingClientRect();
        const cx = (r.left + r.width  / 2 - playRect.left) / z;
        const cy = (r.top  + r.height / 2 - playRect.top)  / z;
        obstacles.push({
            x: cx - state.cardSize / 2,
            y: cy - state.cardSize / 2,
            w: state.cardSize,
            h: state.cardSize,
        });
    });
    playArea.querySelectorAll('.clue-badge').forEach((el) => {
        const r = el.getBoundingClientRect();
        obstacles.push({
            x: (r.left - playRect.left) / z,
            y: (r.top  - playRect.top)  / z,
            w: r.width  / z,
            h: r.height / z,
        });
    });
    // FLOWER-BOARD bounding box — added FIRST so the .some() overlap check
    // in findFreeSlots short-circuits immediately for any candidate
    // position inside the board (no need to test every slot/badge rect
    // individually). Cards never get placed inside the board.
    const boardElForObs = playArea.querySelector('.flower-board');
    if (boardElForObs) {
        const br = boardElForObs.getBoundingClientRect();
        const boardObs = {
            x: (br.left - playRect.left) / z,
            y: (br.top  - playRect.top)  / z,
            w: br.width  / z,
            h: br.height / z,
        };
        // unshift = put at front of array for fast-exit
        obstacles.unshift(boardObs);
    }
    // Already-saved card positions count as obstacles too — never overlay
    // a card whose position is fixed by state.trayPositions.
    const needPositions = [];      // [{ idx, id }] for cards without a saved pos
    state.palette.forEach((id, idx) => {
        const saved = state.trayPositions[id];
        if (saved) obstacles.push(cardRectAt(saved.x, saved.y));
        else       needPositions.push({ idx, id });
    });

    // Placement algorithm: walk Y top → bottom in Y_STEP px steps. At each row,
    // start at the horizontal centre and try ±X_STEP px outward (centre, ‑X_STEP,
    // +X_STEP, ‑2*X_STEP, +2*X_STEP, …). First position that fits (a) inside play-area
    // and (b) without overlapping anything wins; then we keep trying further
    // positions in the same row before moving down.
    const Y_STEP = 5;
    const X_STEP = 5;
    function findFreeSlots(maxY, count) {
        const found = [];
        const centerX = (playW - state.cardSize) / 2;
        const ys = [];
        for (let y = 0; y + state.cardSize <= maxY; y += Y_STEP) ys.push(y);
        // Always try the very bottom row too, so an extension of play-area
        // that doesn't land on a 100 px boundary still gets a placement
        // attempt at its lowest valid Y.
        const lastY = maxY - state.cardSize;
        if (lastY > 0 && (ys.length === 0 || ys[ys.length - 1] !== lastY)) ys.push(lastY);
        for (const y of ys) {
            const offsets = [0];
            for (let off = X_STEP; ; off += X_STEP) {
                const leftOk  = centerX - off >= 0;
                const rightOk = centerX + off + state.cardSize <= playW;
                if (!leftOk && !rightOk) break;
                if (leftOk)  offsets.push(-off);
                if (rightOk) offsets.push(off);
            }
            for (const off of offsets) {
                const x = centerX + off;
                const cr = cardRectAt(x, y);
                const hitIdx = obstacles.findIndex((o) => rectsOverlap(cr, o));
                if (hitIdx >= 0) continue;
                found.push({ x, y });
                obstacles.push(cr);
                if (found.length >= count) return found;
            }
        }
        return found;
    }

    let newSlots = findFreeSlots(playH, needPositions.length);
    // Auto-fit: if not every card got a slot WITHIN the visible play-area
    // (no extension allowed — cards must fit on screen without scrolling),
    // reduce zoom by 10 % and re-render. Iterates down to ZOOM_MIN.
    if (newSlots.length < needPositions.length
            && getZoom() > ZOOM_MIN + 1e-6) {
        const nextZoom = Math.max(ZOOM_MIN,
            Math.round((getZoom() - 0.1) * 10) / 10);
        queueMicrotask(() => {
            if (document.body.dataset.screen !== 'play') return;
            state.zoom = nextZoom;
            updateZoomButtonsState();
            saveSettings();
            const inSlot = new Set(Object.values(state.placements || {}));
            Object.keys(state.trayPositions || {}).forEach((k) => {
                if (!inSlot.has(parseInt(k, 10))) delete state.trayPositions[k];
            });
            saveGameState();
            const saved = loadGameState();
            if (saved) restoreGameState(saved);
        });
        return;
    }
    // Last-resort fallback for any cards left without a slot at ZOOM_MIN —
    // stagger them so they're at least distinct.
    needPositions.forEach((np, i) => {
        const slot = newSlots[i];
        if (slot) {
            state.trayPositions[np.id] = { x: slot.x, y: slot.y };
        } else {
            state.trayPositions[np.id] = {
                x: TRAY_GAP + (i % 6) * (state.cardSize / 6 + 8),
                y: TRAY_GAP + i * (state.cardSize / 6 + 8),
            };
        }
    });

    state.palette.forEach((id) => {
        const card = makePlayPetal(id);
        card.style.width  = state.cardSize + 'px';
        card.style.height = state.cardSize + 'px';
        const pos = state.trayPositions[id];
        card.style.left = pos.x + 'px';
        card.style.top = pos.y + 'px';
        playArea.appendChild(card);
    });

    // (Auto-fit happens up above, BEFORE positions are committed: if not
    // all cards fit at the current state.zoom, we abort this render and
    // queue another at state.zoom − 0.1. By the time we reach this point
    // every card has a slot.)

    requestAnimationFrame(() => {
        window.fitAllPetalWords(r);
        // Scroll so the flower sits centred — the play-area is typically larger
        // than the visible area, so the user can then scroll in every direction
        // from the centre. #app-root is the page's sole scroll container (body
        // and html are overflow:hidden so the topbar stays locked on mobile).
        const boardEl = playArea.querySelector('.flower-board');
        const scroller = document.getElementById('app-root');
        if (boardEl && scroller) {
            const br = boardEl.getBoundingClientRect();
            const sr = scroller.getBoundingClientRect();
            const dx = (br.left + br.width  / 2) - (sr.left + sr.width  / 2);
            const dy = (br.top  + br.height / 2) - (sr.top  + sr.height / 2);
            scroller.scrollBy(dx, dy);
        }
    });

    updateLockInButtonState();
}

// Global Ctrl+wheel zoom + 2-finger pinch zoom. Bound once on document
// (not per-render) so the gestures work on play AND create screens, and so
// they replace the browser's native zoom (which would scale topbar/toolbar
// too). They call setZoom which only updates #app-root's --play-zoom.
if (typeof window !== 'undefined' && !window._zoomGesturesBound) {
    window._zoomGesturesBound = true;
    // Ctrl+wheel.
    window.addEventListener('wheel', (e) => {
        if (!e.ctrlKey) return;
        // Only when over #app-root, not topbar/toolbar.
        const appRoot = document.getElementById('app-root');
        if (!appRoot || !appRoot.contains(e.target)) return;
        e.preventDefault();
        const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
        setZoom(getUserZoom() + delta);
    }, { passive: false });
    // Pinch (two-finger touch) anywhere over #app-root. We zoom around the
    // midpoint of the two fingers and let the midpoint also pan the
    // content — so the unzoomed content point under that midpoint at
    // touchstart stays glued to it for the rest of the gesture.
    let pinchDist0 = 0;
    let pinchZoom0 = 1;
    // Content coords (in PRE-zoom doc pixels) of the starting finger
    // midpoint — the fixed anchor we keep under the moving midpoint.
    let pinchAnchorCX = 0;
    let pinchAnchorCY = 0;
    const tDist = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const tMid  = (a, b) => ({ x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 });
    window.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 2) return;
        const appRoot = document.getElementById('app-root');
        if (!appRoot || !appRoot.contains(e.target)) return;
        pinchDist0 = tDist(e.touches[0], e.touches[1]);
        pinchZoom0 = getUserZoom();
        const mid = tMid(e.touches[0], e.touches[1]);
        const rect = appRoot.getBoundingClientRect();
        // Convert screen midpoint → unzoomed content coord. With CSS
        // `zoom: z` on .play-area, scroll values are in zoomed doc pixels,
        // so we divide by z to get the pre-zoom content position.
        pinchAnchorCX = (appRoot.scrollLeft + (mid.x - rect.left)) / pinchZoom0;
        pinchAnchorCY = (appRoot.scrollTop  + (mid.y - rect.top )) / pinchZoom0;
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length !== 2 || pinchDist0 <= 0) return;
        const appRoot = document.getElementById('app-root');
        if (!appRoot || !appRoot.contains(e.target)) return;
        e.preventDefault();
        const dist = tDist(e.touches[0], e.touches[1]);
        // Quantise to 0.1 steps — keeps the gesture snappy on phones by
        // suppressing per-frame CSS / scroll churn when the finger
        // distance only nudges by a few pixels.
        const newZoom = clampZoom(Math.round(pinchZoom0 * (dist / pinchDist0) * 10) / 10);
        if (newZoom === state.userZoom) return;
        // FAST PATH — skip setZoom (which calls saveSettings / writes
        // localStorage on every frame and causes choppy pinch on phones).
        // Apply the value directly to the CSS variable and in-memory state;
        // the touchend handler commits + refreshes UI / persistence once.
        state.userZoom = newZoom;
        appRoot.style.setProperty('--play-zoom', newZoom);
        // Re-position scroll so the anchor content point sits under the
        // CURRENT midpoint.
        const mid = tMid(e.touches[0], e.touches[1]);
        const rect = appRoot.getBoundingClientRect();
        appRoot.scrollLeft = pinchAnchorCX * newZoom - (mid.x - rect.left);
        appRoot.scrollTop  = pinchAnchorCY * newZoom - (mid.y - rect.top );
    }, { passive: false });
    const endPinch = (e) => {
        if (e.touches.length < 2 && pinchDist0 > 0) {
            pinchDist0 = 0;
            // Commit the gesture's final zoom: persist + refresh label.
            saveSettings();
            updateZoomButtonsState();
        }
    };
    window.addEventListener('touchend', endPinch);
    window.addEventListener('touchcancel', endPinch);

    // Middle-mouse-button drag → pan #app-root (works on both create and
    // play screens). Press the mouse-wheel and drag the cursor: the scroll
    // container follows the cursor, the same way image-viewers / map tools
    // pan with the wheel button.
    let mPanActive = false;
    let mPanStartX = 0, mPanStartY = 0;
    let mPanScrollLeft = 0, mPanScrollTop = 0;
    let mPanPrevCursor = '';
    window.addEventListener('mousedown', (e) => {
        if (e.button !== 1) return;            // middle button only
        const appRoot = document.getElementById('app-root');
        if (!appRoot || !appRoot.contains(e.target)) return;
        e.preventDefault();                    // suppress browser auto-scroll
        mPanActive = true;
        mPanStartX = e.clientX;
        mPanStartY = e.clientY;
        mPanScrollLeft = appRoot.scrollLeft;
        mPanScrollTop  = appRoot.scrollTop;
        mPanPrevCursor = document.body.style.cursor;
        document.body.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', (e) => {
        if (!mPanActive) return;
        const appRoot = document.getElementById('app-root');
        if (!appRoot) return;
        appRoot.scrollLeft = mPanScrollLeft - (e.clientX - mPanStartX);
        appRoot.scrollTop  = mPanScrollTop  - (e.clientY - mPanStartY);
    });
    const endMPan = (e) => {
        if (!mPanActive) return;
        if (e && e.type === 'mouseup' && e.button !== 1) return;
        mPanActive = false;
        document.body.style.cursor = mPanPrevCursor;
    };
    window.addEventListener('mouseup', endMPan);
    window.addEventListener('blur', endMPan);
    // Block the default browser middle-click "auto-scroll cursor" gesture.
    window.addEventListener('auxclick', (e) => {
        if (e.button === 1) e.preventDefault();
    });
}

function updateTryCounter() {
    const el = document.getElementById('try-counter');
    if (el) el.textContent = t('tries', { c: (state.tries || 0) + 1 });
}

// Lock-in is only enabled once every flower slot has a petal-card in it.
function updateLockInButtonState() {
    const btn = document.getElementById('btn-lockin');
    if (!btn) return;
    const filled = Object.keys(state.placements || {}).length === state.n;
    btn.disabled = !filled;
}

// "Lock in" — remove every placed petal that isn't correct (wrong slot OR
// wrong rotation), bump the try counter, and let the player keep going.
function lockInGuess() {
    const wrong = [];
    for (const slotKey of Object.keys(state.placements)) {
        const slot = parseInt(slotKey, 10);
        const petalId = state.placements[slot];
        const placedOk = petalId === slot;
        const rotOk = (state.petals[petalId] || {}).rotation === 0;
        if (!placedOk || !rotOk) wrong.push(petalId);
    }
    for (const id of wrong) returnToTray(id);
    state.tries = (state.tries || 0) + 1;
    updateTryCounter();
    updateLockInButtonState();
    if (wrong.length === 0 && Object.keys(state.placements).length === state.n) {
        markGameDone(gamePayload());
        showAllCorrectModal();
    } else {
        showBanner(t('score', { c: state.n - wrong.length, t: state.n }));
    }
    saveGameState();
}

// Celebratory modal shown when every petal is in its correct slot at rotation 0.
function showAllCorrectModal() {
    const existing = document.getElementById('all-correct-overlay');
    if (existing) existing.remove();
    const overlay = el('div', { id: 'all-correct-overlay', class: 'popup-overlay' });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    const box = el('div', { class: 'popup-box all-correct-box' });
    const close = el('button', {
        type: 'button', class: 'popup-close',
        'aria-label': 'Close',
        onclick: () => overlay.remove(),
    }, '×');
    box.appendChild(close);
    const body = el('div', { class: 'popup-body all-correct-body' });
    // Mini bouquet of three flowers as the celebratory artwork.
    const art = el('div', { class: 'all-correct-art' });
    for (let i = 0; i < 3; i++) {
        const mini = window.renderFlowerSVG(6);
        mini.classList.add('mini-flower');
        art.appendChild(mini);
    }
    body.appendChild(art);
    body.appendChild(el('h2', { class: 'all-correct-title' }, t('allCorrect')));
    body.appendChild(el('p', { class: 'all-correct-sub' },
        t('score', { c: state.n, t: state.n }) + ' · ' +
        t('tries', { c: state.tries || 1 })));
    const actions = el('div', { class: 'popup-actions' });
    const ok = el('button', {
        class: 'btn primary big', type: 'button',
        onclick: () => overlay.remove(),
    }, 'OK');
    actions.appendChild(ok);
    body.appendChild(actions);
    box.appendChild(body);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

// Reveal — auto-place every real petal in its correct slot at rotation 0,
// then morph the Reveal button into an Exit button that returns to the
// main menu (clearing the saved game and any share-URL hash).
function doReveal() {
    for (let i = 0; i < state.n; i++) {
        state.petals[i].rotation = 0;
        state.petalRot[i] = 0;
        const card = document.querySelector(`.petal-card[data-petal-id="${i}"]`);
        if (card) window.refreshPetalCard(card, state.petals[i]);
        // Pass slotAngleDeg as currentAngleDeg AND noShift=true so
        // placePetal's word-screen-stability rotation compensation is
        // skipped — Reveal wants rotation 0 to stick, not be re-cycled.
        const slotAngleDeg = (i / state.n) * 360;
        placePetal(i, i, slotAngleDeg, true);
    }
    markGameDone(gamePayload());
    saveGameState();

    const btn = document.getElementById('btn-reveal');
    if (btn) {
        btn.textContent = t('exit') || 'Exit';
        btn.disabled = false;
        btn.onclick = () => {
            state.placements = {};
            state.trayPositions = {};
            state.tries = 0;
            try { localStorage.removeItem(GAME_STATE_KEY); } catch {}
            if (location.hash) {
                history.replaceState({ screen: 'setup' }, '',
                    location.pathname + location.search);
            }
            navigate('setup');
        };
    }
}

// Modal: confirm before exiting a game in progress.
function confirmExit(onConfirm) {
    const existing = document.getElementById('info-popup-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'info-popup-overlay';
    overlay.className = 'popup-overlay';
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    const box = document.createElement('div');
    box.className = 'popup-box';
    box.style.maxWidth = '380px';
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'popup-close';
    close.setAttribute('aria-label', 'Close');
    close.textContent = '×';
    close.addEventListener('click', () => overlay.remove());
    box.appendChild(close);
    const body = document.createElement('div');
    body.className = 'popup-body';
    body.innerHTML = `<h3>${t('exitTitle')}</h3><p>${t('exitMsg')}</p>`;
    const actions = document.createElement('div');
    actions.className = 'popup-actions';
    const cancel = document.createElement('button');
    cancel.className = 'btn';
    cancel.textContent = t('cancel');
    cancel.addEventListener('click', () => overlay.remove());
    const ok = document.createElement('button');
    ok.className = 'btn danger';
    ok.textContent = t('exit');
    ok.addEventListener('click', () => {
        overlay.remove();
        // Clear in-game state so it doesn't resume on next reload.
        state.placements = {};
        state.trayPositions = {};
        state.tries = 0;
        try { localStorage.removeItem(GAME_STATE_KEY); } catch {}
        onConfirm();
    });
    actions.appendChild(cancel);
    actions.appendChild(ok);
    body.appendChild(actions);
    box.appendChild(body);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

// Modal: focused view of ONE boundary — the two petal-cards on either side
// of it (large, at the top), a text input above them to enter the boundary's
// clue, and every other petal-card shown small under "Other cards" for
// reference. Prev/Next buttons walk through the n boundaries.
// Changes are BUFFERED in a local clues[] array; Apply commits them to
// state.clues and the badge inputs, Cancel discards, Play applies + starts.
function openSimpleDialog(startBoundary) {
    const existing = document.getElementById('simple-dialog-overlay');
    if (existing) existing.remove();
    let cur = startBoundary || 0;
    const buffer = (state.clues || []).slice();
    while (buffer.length < state.n) buffer.push('');
    const overlay = el('div', { id: 'simple-dialog-overlay', class: 'popup-overlay' });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    const box = el('div', { class: 'popup-box simple-dialog-box' });
    const close = el('button', {
        type: 'button', class: 'popup-close',
        'aria-label': 'Close',
        onclick: () => overlay.remove(),
    }, '×');
    box.appendChild(close);
    const body = el('div', { class: 'popup-body simple-dialog-body' });
    box.appendChild(body);

    // Swipe horizontally on the modal to move between boundaries:
    // swipe left → next, swipe right → previous. Skipped when the touch
    // starts on an input or button (so typing / button taps still work).
    let swipeStartX = 0, swipeStartY = 0, swipeActive = false;
    const SWIPE_THRESHOLD = 50;
    box.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) { swipeActive = false; return; }
        const tg = e.target;
        if (tg && tg.closest && tg.closest('input,button,select,textarea,.simple-others-wrap')) {
            swipeActive = false;
            return;
        }
        swipeStartX = e.touches[0].clientX;
        swipeStartY = e.touches[0].clientY;
        swipeActive = true;
    }, { passive: true });
    box.addEventListener('touchend', (e) => {
        if (!swipeActive) return;
        swipeActive = false;
        if (e.changedTouches.length !== 1) return;
        const dx = e.changedTouches[0].clientX - swipeStartX;
        const dy = e.changedTouches[0].clientY - swipeStartY;
        if (Math.abs(dx) < SWIPE_THRESHOLD) return;
        if (Math.abs(dx) <= Math.abs(dy)) return;     // mostly vertical → ignore
        cur = dx < 0
            ? (cur + 1) % state.n                     // swipe left → next
            : (cur - 1 + state.n) % state.n;          // swipe right → prev
        render();
    });
    box.addEventListener('touchcancel', () => { swipeActive = false; });

    function applyBuffer() {
        for (let k = 0; k < state.n; k++) {
            state.clues[k] = buffer[k] || '';
            const badge = document.querySelector(`.clue-badge[data-boundary="${k}"]`);
            const inp = badge && badge.querySelector('.clue-text-input');
            if (inp) {
                inp.value = state.clues[k];
                inp.classList.remove('invalid');
            }
        }
        updatePlayButtonState();
        saveGameState();
    }

    function render() {
        body.replaceChildren();
        const leftK  = cur;
        const rightK = (cur + 1) % state.n;

        // Boundary label on one row, then the clue input below at 80 % of
        // modal width. Wrapped together so they animate / move as a unit
        // and inherit the top-locked flex-shrink rule.
        const inputRow = el('div', { class: 'simple-input-row' });
        const labelText = (t('boundary') || 'Boundary') + ' ' + (cur + 1) + ' / ' + state.n;
        const label = el('div', { class: 'simple-boundary-label' }, labelText);
        const clueInput = el('input', {
            type: 'text', class: 'clue-text-input simple-clue-input',
            placeholder: t('cluePh') || 'Clue',
            value: buffer[cur] || '',
        });
        clueInput.addEventListener('input', () => { buffer[cur] = clueInput.value; });
        // Enter → advance to the next boundary (matches the › button).
        // After render() the input is recreated, so re-query and focus it
        // so typing flow continues uninterrupted.
        clueInput.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            if (cur >= state.n - 1) return;
            cur++;
            render();
            const next = body.querySelector('.simple-clue-input');
            if (next) next.focus();
        });
        inputRow.appendChild(label);
        inputRow.appendChild(clueInput);
        // Clicking anywhere in the wrapper (label, gap) focuses the input
        // so the on-screen keyboard opens on mobile too.
        inputRow.addEventListener('click', (e) => {
            if (e.target !== clueInput) clueInput.focus();
        });
        body.appendChild(inputRow);

        // Pair of large petal-cards flanked by prev/next buttons. Each card
        // is rotated so the shared boundary word lands on top. Prev/Next
        // are disabled at the edges (no wrap-around) so the user can see
        // when they're at the first / last boundary.
        const pairRow = el('div', { class: 'simple-pair-row' });
        const chevronSvg = (dir) => {
            const pts = dir === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6';
            return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
                + 'stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">'
                + `<polyline points="${pts}"/></svg>`;
        };
        const pairPrev = el('button', {
            class: 'btn simple-pair-nav', type: 'button',
            'aria-label': 'Previous boundary',
            disabled: cur === 0,
            onclick: () => { if (cur > 0) { cur--; render(); } },
        });
        pairPrev.innerHTML = chevronSvg('left');
        const pairNext = el('button', {
            class: 'btn simple-pair-nav', type: 'button',
            'aria-label': 'Next boundary',
            disabled: cur >= state.n - 1,
            onclick: () => { if (cur < state.n - 1) { cur++; render(); } },
        });
        pairNext.innerHTML = chevronSvg('right');
        const pair = el('div', { class: 'simple-pair' });
        [leftK, rightK].forEach((k, side) => {
            const card = window.renderPetalCard(state.petals[k], {
                interactive: false, levelN: state.n,
            });
            card.classList.add('simple-pair-card');
            card.classList.add(side === 0 ? 'simple-pair-left' : 'simple-pair-right');
            pair.appendChild(card);
        });
        pairRow.appendChild(pairPrev);
        pairRow.appendChild(pair);
        pairRow.appendChild(pairNext);
        body.appendChild(pairRow);
        requestAnimationFrame(() => window.fitAllPetalWords(pair));

        // "Other cards" title stays PINNED above the scrollable grid.
        body.appendChild(el('h3', { class: 'simple-others-title' }, 'Other cards'));
        const scrollWrap = el('div', { class: 'simple-others-wrap' });
        const others = el('div', { class: 'simple-others' });
        for (let k = 0; k < state.n; k++) {
            if (k === leftK || k === rightK) continue;
            const card = window.renderPetalCard(state.petals[k], {
                interactive: false, levelN: state.n,
            });
            card.classList.add('simple-other-card');
            others.appendChild(card);
        }
        scrollWrap.appendChild(others);
        body.appendChild(scrollWrap);
        requestAnimationFrame(() => window.fitAllPetalWords(others));

        // Actions: Cancel · Apply · Play.
        const actions = el('div', { class: 'popup-actions simple-dialog-actions' });
        const cancelBtn = el('button', {
            class: 'btn', type: 'button',
            onclick: () => overlay.remove(),
        }, t('cancel') || 'Cancel');
        const applyBtn = el('button', {
            class: 'btn primary', type: 'button',
            onclick: () => { applyBuffer(); overlay.remove(); },
        }, 'Apply');
        const playBtnEl = el('button', {
            class: 'btn primary', type: 'button',
            onclick: () => {
                applyBuffer();
                overlay.remove();
                commit(() => navigate('play'));
            },
        }, t('play') || 'Play');
        actions.appendChild(cancelBtn);
        actions.appendChild(applyBtn);
        actions.appendChild(playBtnEl);
        body.appendChild(actions);
    }

    render();
    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

function makePlayPetal(id) {
    const petal = state.petals[id];
    state.locked = state.locked || {};
    const card = window.renderPetalCard(petal, {
        interactive: true,
        levelN: state.n,
        onRotate: (p) => {
            if (state.locked[p.id]) return;
            p.rotation = (p.rotation + 1) % 4;
            state.petalRot[p.id] = p.rotation;
            const node = document.querySelector(`.petal-card[data-petal-id="${p.id}"]`);
            if (node) window.refreshPetalCard(node, p);
        },
    });
    // Unique z-index per card so two overlapping cards always stack in the
    // same, predictable order (rather than depending on DOM insertion order).
    card.style.zIndex = String(id + 1);
    // touch-action: pinch-zoom — we own single-finger touches (long-press →
    // drag, or our manual finger-scroll below), but two-finger pinch-zoom
    // gestures are handed to the browser so the user can still zoom even
    // when one finger started on a card. With `none` the browser blocked
    // pinch when any touch began here; with `pinch-zoom` only the pinch
    // gesture is allowed, single-finger pans still come to our handler.
    card.style.touchAction = 'pinch-zoom';
    card.style.webkitTouchCallout = 'none';
    card.style.userSelect = 'none';
    card.style.webkitUserSelect = 'none';

    // Clicking rotates (unless locked or suppressed by an immediately-prior
    // long-press / drag — see `suppressClick`). The visual rotation is animated
    // (~500 ms) by spinning the card an extra 90°; once the spin ends we swap
    // the word content and reset the inline transform so the new arrangement
    // sits exactly where the spin left off (no visible jump).
    let suppressClick = false;
    let rotateAnim = false;
    card.addEventListener('click', (e) => {
        if (suppressClick) { e.stopImmediatePropagation(); suppressClick = false; return; }
        if (state.locked[id]) return;
        if (rotateAnim) return;
        rotateAnim = true;

        const inSlot = card.closest('.flower-slot');
        // Visual angle of the card RIGHT NOW (before the spin) — needed to
        // pick which two cells will need the mid-spin +180° text flip.
        let visualAngleDeg = 0;
        if (inSlot) {
            const a = getComputedStyle(inSlot).getPropertyValue('--slot-angle').trim();
            visualAngleDeg = a ? parseFloat(a) : 0;
        } else {
            visualAngleDeg = (state.cardAngles && state.cardAngles[id]) || 0;
        }
        const baseAngle = inSlot ? 0 : visualAngleDeg;
        // The +90° card spin + +1 word-cycle leaves the visible WORD at the
        // same screen position but with a 180° rotation mismatch at TWO of the
        // four cells. Which two depends on whether the flips around the
        // diamond are uniform (TR/BL) or alternating (TL/BR).
        const eff = (b) => ((visualAngleDeg + b) % 360 + 360) % 360;
        const flipMinus = eff(-45) > 90 && eff(-45) <= 270;
        const flipPlus  = eff( 45) > 90 && eff( 45) <= 270;
        const togglePair = (flipMinus === flipPlus) ? 'rot-flip-trbl' : 'rot-flip-tlbr';

        card.style.transformOrigin = '50% 50%';
        card.style.transition = 'transform 0.5s ease-in-out';
        card.style.transform = `rotate(${baseAngle + 90}deg)`;

        // Mid-spin (t=250): toggle the two cells that need it. Hiding the
        // 180° text flip inside the spin keeps it invisible to the eye —
        // showing it as an abrupt change after the card stops is what the
        // user complained about.
        setTimeout(() => {
            card.classList.add(togglePair);
        }, 250);
        // End of spin (t=500): swap content + snap card transform back +
        // remove the flip class. The per-edge text rotation now equals what
        // it was just before the snap, so there's no visual jump.
        setTimeout(() => {
            card.style.transition = '';
            petal.rotation = (petal.rotation + 1) % 4;
            state.petalRot[petal.id] = petal.rotation;
            window.refreshPetalCard(card, petal);
            if (inSlot) {
                card.style.transform = '';
                card.style.transformOrigin = '';
            } else {
                card.style.transform = `rotate(${baseAngle}deg)`;
            }
            card.classList.remove(togglePair);
            rotateAnim = false;
            saveGameState();
        }, 500);
    });
    // Suppress the OS context-menu — right-click is handled in mousedown below.
    card.addEventListener('contextmenu', (e) => { e.preventDefault(); });

    // ---- Mouse-event drag (works for both mouse and touch via the browser's
    //      emulated mouse events; touch-action: manipulation removes the delay)
    // Pattern:
    //   • quick click                              → rotate
    //   • press-and-hold (≥PICKUP_MS) without moving → lock toggle
    //   • press-and-hold then move ≥DRAG_THRESHOLD   → card follows the cursor;
    //                                                  release drops it on the
    //                                                  slot or play-area under it
    // Pointer Events are mouse-style events that also work for touch. The
    // `pointerType` ('mouse' | 'touch' | 'pen') lets us require a long-press
    // only for touch input while keeping immediate click-and-drag for mouse.
    const LONG_PRESS_MS  = 100;   // touch only: hold this long before pickup
    const DRAG_THRESHOLD = 5;     // mouse: pointer movement before drag starts

    let longPressTimer = null;
    // mode: 'idle' | 'pending' | 'panning' | 'lock-armed' | 'dragging'
    //   panning = touch started on card but user is finger-scrolling the
    //   play-area (we forward the deltas to #app-root.scrollLeft/Top).
    let mode = 'idle';
    let startX = 0, startY = 0;
    let dragOffsetX = 0, dragOffsetY = 0;
    let panStartScrollLeft = 0, panStartScrollTop = 0;
    let prevInline = null;
    let activePointerId = null;
    let liftedAngleDeg = 0;       // visual rotation (degrees) carried during drag

    function liftCard() {
        // Determine the card's current visual rotation (degrees). If it was
        // inside a rotated slot we use the slot's --slot-angle; otherwise we
        // use whatever rotation was previously applied to it in the play area.
        const slot = card.closest('.flower-slot');
        if (slot) {
            const a = getComputedStyle(slot).getPropertyValue('--slot-angle').trim();
            liftedAngleDeg = a ? parseFloat(a) : 0;
        } else {
            liftedAngleDeg = (state.cardAngles && state.cardAngles[id]) || 0;
        }
        const slotAngle = liftedAngleDeg + 'deg';

        // Capture screen-space centre + drag offset BEFORE we move the card —
        // those numbers must be in viewport coords.
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top  + rect.height / 2;

        prevInline = {
            position:        card.style.position,
            left:            card.style.left,
            top:             card.style.top,
            width:           card.style.width,
            height:          card.style.height,
            zIndex:          card.style.zIndex,
            transform:       card.style.transform,
            transformOrigin: card.style.transformOrigin,
            transition:      card.style.transition,
            zoom:            card.style.zoom,
        };
        // Kill any in-flight CSS transition (e.g. placePetal's 0.28s ease-out
        // snap to rotate(0deg)). Without this, the transform we set below gets
        // animated from the in-progress value, so a card grabbed mid-snap
        // visibly spins through an intermediate angle (45° was the symptom)
        // before reaching the slot's angle.
        card.style.transition = 'none';

        // Copy the slot's CSS custom properties onto the card BEFORE we
        // re-parent it — the slot's --slot-angle / --text-flip-* are how the
        // petal-words decide their rotation. Without this they fall back to
        // the defaults and the words appear to rotate during drag.
        if (slot) {
            const cs = getComputedStyle(slot);
            ['--slot-angle', '--text-flip-tl', '--text-flip-tr',
             '--text-flip-br', '--text-flip-bl'].forEach((k) => {
                const v = cs.getPropertyValue(k);
                if (v) card.style.setProperty(k, v.trim());
            });
        }

        // CSS gotcha: a transformed ancestor (the rotated .flower-slot) becomes
        // the containing block for position:fixed descendants. To get true
        // viewport-relative positioning, the card has to leave any rotated
        // ancestor for the duration of the drag — body is safe.
        document.body.appendChild(card);
        // Some browsers implicitly release pointer capture when the captured
        // element is reparented. Re-acquire it so a FAST drag (cursor leaves
        // the card's bounding box between frames) still sends pointermove /
        // pointerup to our handlers instead of getting lost mid-drag.
        if (activePointerId != null) {
            try { card.setPointerCapture(activePointerId); } catch {}
        }

        card.style.position = 'fixed';
        // Match the play-area's CSS zoom via transform: scale(). The layout
        // box stays cardSize × cardSize (so pointer events / hit-testing
        // behave normally on PC), but the visual rendering — including the
        // clamp()+cqw font-size of .petal-word inside — scales the same way
        // as inside the zoomed play-area. (Setting `zoom` on the card itself
        // broke mouse drag on PC.)
        card.style.width  = state.cardSize + 'px';
        card.style.height = state.cardSize + 'px';
        card.style.zIndex = '100';
        card.style.transformOrigin = '50% 50%';
        card.style.transform = `rotate(${slotAngle}) scale(${getUserZoom()})`;
        // Layout box is unscaled (cardSize); transform scales VISUALLY
        // around 50%/50%, so the box centre stays at left + cardSize/2.
        const halfDrag = state.cardSize / 2;
        card.style.left = (cx - halfDrag) + 'px';
        card.style.top  = (cy - halfDrag) + 'px';

        // Cursor's *screen* offset from card centre — invariant under rotation.
        dragOffsetX = startX - cx;
        dragOffsetY = startY - cy;
    }

    function restoreInline() {
        card.style.position        = (prevInline && prevInline.position) || '';
        card.style.left            = (prevInline && prevInline.left) || '';
        card.style.top             = (prevInline && prevInline.top) || '';
        card.style.width           = (prevInline && prevInline.width) || '';
        card.style.height          = (prevInline && prevInline.height) || '';
        card.style.zIndex          = (prevInline && prevInline.zIndex) || '';
        card.style.transform       = (prevInline && prevInline.transform) || '';
        card.style.transformOrigin = (prevInline && prevInline.transformOrigin) || '';
        card.style.transition      = (prevInline && prevInline.transition) || '';
        card.style.zoom            = (prevInline && prevInline.zoom) || '';
        // Drop the per-drag copies of the slot's CSS custom properties — the
        // card inherits them again when re-parented into a slot.
        ['--slot-angle', '--text-flip-tl', '--text-flip-tr',
         '--text-flip-br', '--text-flip-bl'].forEach((k) => card.style.removeProperty(k));
    }

    card.addEventListener('pointerdown', (e) => {
        if (e.button === 2) {
            // Desktop right-click → toggle lock.
            e.preventDefault();
            suppressClick = true;
            toggleLock(id);
            return;
        }
        if (e.button !== 0) return;
        e.preventDefault();
        try { card.setPointerCapture(e.pointerId); } catch {}
        activePointerId = e.pointerId;
        startX = e.clientX;
        startY = e.clientY;
        mode = 'pending';
        suppressClick = false;

        // Touch: arm a long-press to enter drag mode (or to unlock a locked
        // card — touch devices have no right-click).
        if (e.pointerType === 'touch') {
            // Remember the scroll origin so an early finger-move can be
            // forwarded to #app-root as a manual scroll (the user just wanted
            // to scroll the play-area but happened to start on a card).
            const sc = document.getElementById('app-root');
            panStartScrollLeft = sc ? sc.scrollLeft : 0;
            panStartScrollTop  = sc ? sc.scrollTop  : 0;
            longPressTimer = setTimeout(() => {
                if (mode !== 'pending') return;
                mode = 'lock-armed';
                suppressClick = true;
                if (navigator.vibrate) navigator.vibrate(15);
                card.classList.add('picked-up');
                // Locked cards: don't lift, since dragging is disabled. The
                // release will simply toggle (unlock) the card.
                if (!state.locked[id]) liftCard();
            }, LONG_PRESS_MS);
        }
    });

    card.addEventListener('pointermove', (e) => {
        if (e.pointerId !== activePointerId) return;
        if (mode === 'idle') return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const moved = Math.hypot(dx, dy);

        if (mode === 'pending') {
            // Mouse: immediate drag once moved enough. Touch: an early move
            // (before the long-press timer fires) means the user wants to
            // SCROLL the play-area, not pick up a card — promote to 'panning'
            // and forward the deltas to #app-root.scroll*.
            if (e.pointerType !== 'touch' && moved >= DRAG_THRESHOLD) {
                mode = 'dragging';
                suppressClick = true;
                card.classList.add('picked-up');
                liftCard();
            } else if (e.pointerType === 'touch' && moved > 8) {
                if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
                mode = 'panning';
                suppressClick = true;
            } else {
                return;
            }
        } else if (mode === 'lock-armed') {
            if (moved < DRAG_THRESHOLD) return;
            mode = 'dragging';
        }

        if (mode === 'panning') {
            // Manual finger-scroll: keep the play-area pinned to the touch.
            const sc = document.getElementById('app-root');
            if (sc) {
                sc.scrollLeft = panStartScrollLeft - dx;
                sc.scrollTop  = panStartScrollTop  - dy;
            }
            return;
        }

        if (state.locked[id]) return;                // locked cards never drag

        if (mode === 'dragging') {
            // Move card so its CENTRE = cursor − (screen offset captured at lift).
            // Lifted card uses transform: scale() (not CSS zoom), so its
            // layout box stays cardSize and we centre on the cursor with
            // half of the UNSCALED width.
            const half = state.cardSize / 2;
            const newCx = e.clientX - dragOffsetX;
            const newCy = e.clientY - dragOffsetY;
            card.style.left = (newCx - half) + 'px';
            card.style.top  = (newCy - half) + 'px';
            // Auto-scroll #app-root when the cursor is near a viewport edge.
            // Lifted card is position:fixed, so it stays glued to the cursor
            // while the world scrolls under it.
            updateEdgeScroll(e.clientX, e.clientY);
        }
    });

    function endPointer(e, cancelled) {
        if (e && e.pointerId !== activePointerId) return;
        activePointerId = null;
        if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
        stopEdgeScroll();
        const prevMode = mode;
        mode = 'idle';
        if (prevMode === 'pending' || prevMode === 'idle') return;
        if (prevMode === 'panning') {
            // Manual scroll-with-touch ended — nothing to clean up; the
            // suppressClick flag set by the move handler keeps a stray click
            // from firing after a flicked scroll.
            return;
        }
        card.classList.remove('picked-up');
        if (prevMode === 'lock-armed') {
            // Locked-card branch: liftCard wasn't called, so no inline-style
            // restoration or re-parenting is needed — just toggle the lock.
            if (state.locked[id]) {
                if (!cancelled) toggleLock(id);
                return;
            }
            // Unlocked-card lock-arm: card was lifted to <body>. Put it back
            // (slot or play-area) and restore its inline styles, then lock it.
            restoreInline();
            const slotIdx = lookupSlot(id);
            if (slotIdx != null) {
                const slotDrop = document.querySelector(
                    `.flower-slot[data-slot="${slotIdx}"] .slot-drop`);
                if (slotDrop) slotDrop.appendChild(card);
            } else {
                const playArea = document.getElementById('play-area');
                if (playArea) playArea.appendChild(card);
            }
            if (!cancelled) toggleLock(id);
            return;
        }
        if (prevMode === 'dragging') {
            restoreInline();
            if (cancelled || !e) return;
            // Drop — find target under the release point.
            card.style.pointerEvents = 'none';
            const target = document.elementFromPoint(e.clientX, e.clientY);
            card.style.pointerEvents = '';
            const slotEl = target && target.closest && target.closest('.flower-slot');
            if (slotEl) {
                const slotIdx = parseInt(slotEl.dataset.slot, 10);
                if (Number.isFinite(slotIdx)) {
                    // Pass the angle the card had at lift so placePetal can
                    // animate the shortest arc to the slot's own angle.
                    placePetal(id, slotIdx, liftedAngleDeg);
                    return;
                }
            }
            const playArea = document.getElementById('play-area');
            if (playArea) {
                const rect = playArea.getBoundingClientRect();
                // Place the card so its centre stays where it was at release.
                // Divide by USER zoom because .play-area has CSS zoom equal
                // to state.userZoom (NOT state.zoom — which is the layout
                // scale, already baked into cardSize at render time).
                const z = getUserZoom();
                const px = (e.clientX - dragOffsetX - rect.left) / z - state.cardSize / 2;
                const py = (e.clientY - dragOffsetY - rect.top)  / z - state.cardSize / 2;
                state.trayPositions[id] = { x: px, y: py };
                const prevSlot = lookupSlot(id);
                if (prevSlot != null) delete state.placements[prevSlot];
                if (card.parentElement !== playArea) playArea.appendChild(card);
                card.style.left = px + 'px';
                card.style.top  = py + 'px';
                // Preserve the rotation the card had at lift (so a card pulled
                // out of a rotated slot keeps that visual angle in the play area).
                state.cardAngles = state.cardAngles || {};
                state.cardAngles[id] = liftedAngleDeg;
                card.style.transformOrigin = '50% 50%';
                card.style.transform = `rotate(${liftedAngleDeg}deg)`;
                card.style.setProperty('--slot-angle', liftedAngleDeg + 'deg');
                applyCardAngleFlips(card, liftedAngleDeg);
                updateLockInButtonState();
                saveGameState();
            }
        }
    }
    card.addEventListener('pointerup',     (e) => endPointer(e, false));
    card.addEventListener('pointercancel', (e) => endPointer(e, true));

    // Visual hint that the card is rotatable. Counter-rotates with the slot
    // so it always reads upright. Hidden when the card is locked.
    const rotIcon = document.createElement('div');
    rotIcon.className = 'petal-rotate-icon';
    rotIcon.setAttribute('aria-hidden', 'true');
    rotIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" '
        + 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<polyline points="23 4 23 10 17 10"/>'
        + '<path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>';
    rotIcon.style.transform = `translate(-50%, -50%) rotate(${(petal.rotation || 0) * 90}deg)`;
    card.appendChild(rotIcon);

    if (state.locked[id]) applyLockVisual(card, true);
    return card;
}

function toggleLock(id) {
    state.locked = state.locked || {};
    const currentlyLocked = !!state.locked[id];
    // Only petals placed in a flower-slot can be locked. Unlocking is always
    // allowed (in case the card somehow left its slot while still flagged).
    if (!currentlyLocked && lookupSlot(id) == null) return;
    state.locked[id] = !currentlyLocked;
    const card = document.querySelector(`.petal-card[data-petal-id="${id}"]`);
    if (card) applyLockVisual(card, !!state.locked[id]);
    saveGameState();
}

function applyLockVisual(card, locked) {
    card.classList.toggle('locked', locked);
    card.setAttribute('draggable', locked ? 'false' : 'true');
    let overlay = card.querySelector('.petal-lock');
    if (locked) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'petal-lock';
            overlay.setAttribute('aria-label', 'Locked');
            overlay.innerHTML = '<svg viewBox="0 0 24 24" fill="none" '
                + 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
                + '<rect x="4.5" y="11" width="15" height="10" rx="2"/>'
                + '<path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
            card.appendChild(overlay);
        }
    } else if (overlay) {
        overlay.remove();
    }
}

function placePetal(petalId, slotIdx, currentAngleDeg, noShift) {
    const card = document.querySelector(`.petal-card[data-petal-id="${petalId}"]`);
    if (!card) return;
    card.classList.remove('correct', 'wrong');

    // Determine the card's current visual angle if not supplied. (When called
    // from a touch/mouse drop, the caller passes liftedAngleDeg; when called
    // from doReveal/restore the card is parked somewhere and we infer.)
    if (currentAngleDeg == null) {
        const oldSlot = card.closest('.flower-slot');
        if (oldSlot) {
            const a = getComputedStyle(oldSlot).getPropertyValue('--slot-angle').trim();
            currentAngleDeg = a ? parseFloat(a) : 0;
        } else {
            currentAngleDeg = (state.cardAngles && state.cardAngles[petalId]) || 0;
        }
    }
    const slotAngleDeg = (slotIdx / state.n) * 360;
    // Diamond cards have 90° rotational symmetry, so any rotation that is a
    // multiple of 90° leaves them visually unchanged. Reduce the delta into
    // the half-open range (-45°, +45°] — the upper boundary closed means an
    // exact 45° difference animates as +45° (= CCW visually), satisfying
    // "prefer counterclockwise when both directions are equally short".
    const raw = currentAngleDeg - slotAngleDeg;
    const delta = raw - Math.ceil((raw - 45) / 90) * 90;
    // Cycle the petal's word rotation by the matching number of 90° steps so
    // each word visually stays at the same screen position as it had in the
    // previous slot. shift is exact (raw − delta is a multiple of 90°).
    const rotationShift = ((Math.round((raw - delta) / 90)) % 4 + 4) % 4;
    // During restore (noShift = true) the saved petal.rotation is already the
    // value the user committed to; don't re-cycle it here.
    if (rotationShift !== 0 && !noShift) {
        const petal = state.petals[petalId];
        petal.rotation = (petal.rotation + rotationShift) % 4;
        state.petalRot[petalId] = petal.rotation;
        window.refreshPetalCard(card, petal);
    }

    // Clear position-related drag leftovers, but keep width/height intact —
    // they were set to state.cardSize at render and must stay that exact size
    // (slot CSS would otherwise fall back to a slightly different `100% of
    // slot` value, which makes the card visually jump size on drag-in).
    card.style.position = '';
    card.style.left = '';
    card.style.top = '';
    card.style.zIndex = '';
    card.style.transition = 'none';
    // Strip the inline --slot-angle / --text-flip-* the card picked up during
    // drag (or from its prior play-area placement). Otherwise they shadow the
    // new slot's CSS variables and the petal-words end up flipped wrong.
    card.style.removeProperty('--slot-angle');
    card.style.removeProperty('--text-flip-tl');
    card.style.removeProperty('--text-flip-tr');
    card.style.removeProperty('--text-flip-br');
    card.style.removeProperty('--text-flip-bl');
    card.style.transformOrigin = '50% 50%';
    // Initial inline rotation = delta — visually the card still sits at its
    // previous angle the instant it lands in the (already-rotated) slot.
    card.style.transform = `rotate(${delta}deg)`;
    if (state.cardAngles) delete state.cardAngles[petalId];

    // If another petal already in that slot, kick it back to its tray position.
    const slotDrop = document.querySelector(`.flower-slot[data-slot="${slotIdx}"] .slot-drop`);
    if (!slotDrop) return;
    const existing = slotDrop.querySelector('.petal-card');
    if (existing && existing !== card) {
        const exId = parseInt(existing.dataset.petalId, 10);
        delete state.placements[lookupSlot(exId)];
        const area = document.getElementById('play-area');
        if (area) area.appendChild(existing);
        const pos = state.trayPositions[exId];
        if (pos) {
            existing.style.left = pos.x + 'px';
            existing.style.top = pos.y + 'px';
        }
    }
    // remove petalId from any previous slot
    const prevSlot = lookupSlot(petalId);
    if (prevSlot != null) delete state.placements[prevSlot];

    state.placements[slotIdx] = petalId;
    slotDrop.appendChild(card);
    if (noShift) {
        // Restoring a saved placement (e.g., on page reload): snap directly
        // into the slot's rotation, no animation. (`noShift` is set by the
        // restoreGameState path, so this also doubles as "no anim" mode.)
        card.style.transition = '';
        card.style.transform = '';
        card.style.transformOrigin = '';
    } else {
        // Force layout, then animate the inline rotation to 0 — visual
        // rotation ends at the slot's own angle via the shortest arc.
        void card.offsetWidth;
        card.style.transition = 'transform 0.28s ease-out';
        card.style.transform = 'rotate(0deg)';
        // After the snap settles, drop the inline transform so the card
        // cleanly inherits the slot's rotation. BUT only if the card is still
        // in this slot: if the user re-grabbed the card mid-snap, liftCard
        // has already moved it to <body> and set its own inline transform —
        // clearing here would wipe that out (the visible symptom: the
        // dragged card spins to 45°, leaving only the inner diamond-body's
        // own rotate(45deg)).
        setTimeout(() => {
            if (card.parentElement !== slotDrop) return;
            card.style.transition = '';
            card.style.transform = '';
            card.style.transformOrigin = '';
        }, 320);
    }
    requestAnimationFrame(() => window.fitCardWords(card));
    updateLockInButtonState();
    saveGameState();
}

function returnToTray(petalId) {
    const card = document.querySelector(`.petal-card[data-petal-id="${petalId}"]`);
    if (!card) return;
    card.classList.remove('correct', 'wrong');
    const prev = lookupSlot(petalId);
    if (prev != null) delete state.placements[prev];
    const area = document.getElementById('play-area');
    if (area) area.appendChild(card);
    const pos = state.trayPositions[petalId];
    if (pos) {
        card.style.left = pos.x + 'px';
        card.style.top  = pos.y + 'px';
    }
    requestAnimationFrame(() => window.fitCardWords(card));
    updateLockInButtonState();
    saveGameState();
}

function lookupSlot(petalId) {
    for (const k in state.placements) if (state.placements[k] === petalId) return parseInt(k, 10);
    return null;
}

// ----- clipboard helper -----
function tryCopy(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text);
            return true;
        }
    } catch {}
    try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
    } catch { return false; }
}

// ----- bootstrap -----
function loadFromHash() {
    const p = decodeState();
    if (!p) return false;
    state.lang = p.l || DEFAULT_LANG;
    state.n = p.n;
    state.e = p.e || 0;
    state.petals = p.p.map((words, i) => ({ id: i, words: words.slice(), rotation: 0 }));
    state.clues = p.c.slice();
    state.shuffleSeed = p.s || 1;
    if (p.mode === 'edit') renderCreate();
    else renderPlay();
    return true;
}

window.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    if (loadFromHash()) {
        history.replaceState({ screen: 'play' }, '', location.href);
        return;
    }
    const saved = loadGameState();
    if (saved) {
        history.replaceState({ screen: saved.screen }, '', location.href);
        restoreGameState(saved);
        return;
    }
    history.replaceState({ screen: 'setup' }, '', location.href);
    renderSetup();
});
window.addEventListener('hashchange', () => loadFromHash());
// Track viewport width so we only re-render when the WIDTH changes, not when
// only the height does. On mobile, focusing a text input opens the on-screen
// keyboard which fires a resize event with the same width but smaller height.
// Re-rendering then would destroy the focused input and the keyboard would
// immediately close.
let lastViewportWidth = window.innerWidth;
window.addEventListener('resize', () => {
    const w = window.innerWidth;
    if (w === lastViewportWidth) return; // height-only resize (mobile keyboard) — ignore
    lastViewportWidth = w;
    const s = document.body.dataset.screen;
    if (s === 'create') renderCreate();
    // Play is NOT re-rendered — card positions must stay stable across
    // pinch / browser zoom and viewport resizes.
});
