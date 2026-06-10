// Bloombine — flower illustration + diamond petal cards.
//
// Visual model: a stylized flower has N curved petals (all the same color —
// the color depends on N, the level). Inside each petal is a diamond-shaped
// slot, rotated to point radially outward, where the player drops a card.
// A card is a diamond with 4 word labels at its TL/TR/BR/BL edges. The rotate
// button cycles those 4 words clockwise.

// Per-level colors. Index = N (number of petals). Out-of-range Ns fall back
// to the next-lower defined level, then wrap.
const LEVEL_COLORS = {
    3:  { fill: '#ec87c0', dark: '#b85a93', light: '#f7c1dc' }, // pink
    4:  { fill: '#2ecc71', dark: '#1e8449', light: '#7ee0a8' }, // green
    5:  { fill: '#1abc9c', dark: '#117a65', light: '#76e0cd' }, // teal
    6:  { fill: '#f1c40f', dark: '#c79a07', light: '#fae07a' }, // yellow
    7:  { fill: '#e67e22', dark: '#b35e10', light: '#f3b27a' }, // orange
    8:  { fill: '#e74c3c', dark: '#a93226', light: '#f3a298' }, // red
    9:  { fill: '#3498db', dark: '#1d6fa5', light: '#86c3eb' }, // blue
    10: { fill: '#9b59b6', dark: '#6c3483', light: '#c8a1d9' }, // purple
    11: { fill: '#f39c12', dark: '#b9770e', light: '#f7c878' }, // amber
    12: { fill: '#34495e', dark: '#1c2833', light: '#7f8c9a' }, // night-blue
};

window.levelColor = function levelColor(n) {
    if (LEVEL_COLORS[n]) return LEVEL_COLORS[n];
    // fall back to whatever defined entry is closest
    const keys = Object.keys(LEVEL_COLORS).map(Number).sort((a, b) => a - b);
    let best = keys[0];
    for (const k of keys) if (k <= n) best = k;
    return LEVEL_COLORS[best];
};

// Geometry constants (all in SVG units, viewBox 0 0 640 640).
window.FLOWER_GEOM = {
    VB: 640,
    HUB_R: 46,            // inner-circle (hub) radius — drawn on top of petals
    PETAL_BASE_R: 23,     // where petal silhouettes start (small, so the bigger
                          // hub circle visibly covers their bases)
    PETAL_TIP_R: 312,     // distance from flower center to the petal tip (clue anchor)
};

// Per-N ring radius (centre of each card to flower centre). For low N the
// big cards otherwise stretch too far from the hub, so we pull them in.
window.slotRadius = function slotRadius(n) {
    const TABLE = { 3: 150, 4: 160, 5: 170, 6: 180 };
    return TABLE[n] || 200;
};

// Compute the diamond bounding-diagonal. For each N take the largest of:
//   - geometric size (2·R·tan(π/N) — adjacent diamond corners just touch), then
//   - bounded radially so the slot fits between the hub and the petal tip.
// SHRINK keeps a small margin inside the petal silhouette.
window.slotDiagonal = function slotDiagonal(n) {
    const G = window.FLOWER_GEOM;
    const R = window.slotRadius(n);
    // SHRINK = 1 → adjacent diamond corners just touch when geometry allows.
    const SHRINK = 1.0;
    // Radial cap: card stays between hub and petal tip.
    const radialCap = 2 * (G.PETAL_TIP_R - R) * SHRINK;
    // Lateral cap: petal half-width near the slot radius is ≈100–105 SVG.
    // Rotated diamond's lateral half-vertex ≈ d/2·1.018, so capping at 210
    // keeps the card from exceeding the petal width by more than 5%.
    const lateralCap = 210;
    const d = 2 * R * Math.tan(Math.PI / n) * SHRINK;
    return Math.min(radialCap, lateralCap, d);
};

function svgEl(tag, attrs) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
}

// Render the decorative flower SVG (background only — slots & cards are HTML overlays).
// viewBox is fixed at 640x640; SVG scales to fill its parent via width=100% height=100%.
window.renderFlowerSVG = function renderFlowerSVG(n) {
    const VB = 640;
    const cx = VB / 2;
    const cy = VB / 2;
    const color = window.levelColor(n);

    const svg = svgEl('svg', {
        viewBox: `0 0 ${VB} ${VB}`,
        class: 'flower-svg',
        preserveAspectRatio: 'xMidYMid meet',
        'aria-hidden': 'true',
    });

    const defs = svgEl('defs', {});

    // single radial gradient for all petals (level color)
    const petalGrad = svgEl('radialGradient', { id: 'petalGrad', cx: '50%', cy: '25%', r: '85%' });
    petalGrad.appendChild(svgEl('stop', { offset: '0%', 'stop-color': color.light, 'stop-opacity': '0.95' }));
    petalGrad.appendChild(svgEl('stop', { offset: '55%', 'stop-color': color.fill }));
    petalGrad.appendChild(svgEl('stop', { offset: '100%', 'stop-color': color.dark }));
    defs.appendChild(petalGrad);

    // hub gradient (warm gold center)
    const hubGrad = svgEl('radialGradient', { id: 'hubGrad', cx: '40%', cy: '40%', r: '70%' });
    hubGrad.appendChild(svgEl('stop', { offset: '0%', 'stop-color': '#fff5c4' }));
    hubGrad.appendChild(svgEl('stop', { offset: '60%', 'stop-color': '#f1c40f' }));
    hubGrad.appendChild(svgEl('stop', { offset: '100%', 'stop-color': '#b9770e' }));
    defs.appendChild(hubGrad);

    // soft glow filter behind petals
    const glow = svgEl('filter', { id: 'softGlow', x: '-20%', y: '-20%', width: '140%', height: '140%' });
    glow.appendChild(svgEl('feGaussianBlur', { stdDeviation: '6', result: 'b' }));
    glow.appendChild(svgEl('feMerge', null));
    defs.appendChild(glow);

    svg.appendChild(defs);

    // Subtle green back-leaves between petals
    const backLeaves = svgEl('g', { opacity: '0.30' });
    for (let k = 0; k < n; k++) {
        const angle = (k + 0.5) * 360 / n;
        const g = svgEl('g', { transform: `translate(${cx},${cy}) rotate(${angle})` });
        g.appendChild(svgEl('ellipse', {
            cx: 0, cy: -160, rx: 72, ry: 100,
            fill: '#1e8449',
        }));
        backLeaves.appendChild(g);
    }
    svg.appendChild(backLeaves);

    // Petals — fixed silhouette across all N (per user revert). Base sits at
    // PETAL_BASE_R; the (bigger) hub circle is drawn afterwards so its disk
    // covers the petal bases (petals appear to come out from behind it).
    const hub = window.FLOWER_GEOM.HUB_R;
    const petalBase = window.FLOWER_GEOM.PETAL_BASE_R;
    for (let k = 0; k < n; k++) {
        const angle = k * 360 / n;
        const g = svgEl('g', { transform: `translate(${cx},${cy}) rotate(${angle})` });

        g.appendChild(svgEl('path', {
            d: `M 0,-${petalBase} C -135,-80 -140,-260 -18,-312 C -6,-318 6,-318 18,-312 C 140,-260 135,-80 0,-${petalBase} Z`,
            fill: 'url(#petalGrad)',
            stroke: color.dark,
            'stroke-width': '2',
            'stroke-linejoin': 'round',
        }));
        g.appendChild(svgEl('ellipse', {
            cx: -30, cy: -250, rx: 17, ry: 40,
            fill: 'rgba(255,255,255,0.4)',
        }));
        g.appendChild(svgEl('ellipse', {
            cx: 22, cy: -110, rx: 9, ry: 20,
            fill: 'rgba(255,255,255,0.18)',
        }));

        svg.appendChild(g);
    }

    // Slot rects in a SECOND pass so they paint above every petal silhouette.
    // Drawing each slot inside its own petal's <g> meant petal k+1 (drawn
    // later) would visibly clip the slot of petal k wherever they overlapped.
    const diag = window.slotDiagonal(n);
    const side = diag / Math.SQRT2;
    for (let k = 0; k < n; k++) {
        const angle = k * 360 / n;
        const g = svgEl('g', { transform: `translate(${cx},${cy}) rotate(${angle})` });
        g.appendChild(svgEl('rect', {
            x: -side / 2, y: -side / 2, width: side, height: side,
            transform: `translate(0,-${window.slotRadius(n)}) rotate(45)`,
            fill: 'rgba(0,0,0,0.18)',
            stroke: color.dark,
            'stroke-width': '2',
            'stroke-dasharray': '5 4',
            rx: '6',
        }));
        svg.appendChild(g);
    }

    // Hub (50% smaller — r:46 → 23, with stamen dots scaled accordingly).
    svg.appendChild(svgEl('circle', {
        cx, cy, r: hub,
        fill: 'url(#hubGrad)',
        stroke: '#7a4e07',
        'stroke-width': '1.5',
    }));

    // Stamen dots — scaled 2× along with the hub so they fill the larger
    // inner circle (ring radius 12→24, dot radius 1.4→2.8, centre dot 3.5→7).
    for (let i = 0; i < 12; i++) {
        const a = (i / 12) * 2 * Math.PI;
        svg.appendChild(svgEl('circle', {
            cx: cx + Math.cos(a) * 24,
            cy: cy + Math.sin(a) * 24,
            r: 2.8,
            fill: '#7a4e07',
        }));
    }
    svg.appendChild(svgEl('circle', { cx, cy, r: 7, fill: '#7a4e07' }));

    return svg;
};

// Build a diamond petal-card DOM node.
// petal: { id, words: [w0,w1,w2,w3], rotation: 0..3 }
// At rotation r, visible[edge] = words[(edge - r + 4) % 4]
//   edges: TL=0, TR=1, BR=2, BL=3 (clockwise from upper-left)
window.renderPetalCard = function renderPetalCard(petal, opts = {}) {
    const n = opts.levelN || 6;
    const color = opts.showColor === false
        ? { fill: '#3c504b', dark: 'rgba(255,255,255,0.15)' }
        : window.levelColor(n);

    const card = document.createElement('div');
    card.className = 'petal-card';
    if (opts.decoy) card.classList.add('decoy');
    card.style.setProperty('--petal-fill', color.fill);
    card.style.setProperty('--petal-dark', color.dark);
    card.dataset.petalId = String(petal.id);
    card.dataset.rotation = String(petal.rotation || 0);

    // Diamond body (decorative square rotated 45° via CSS)
    const body = document.createElement('div');
    body.className = 'diamond-body';
    card.appendChild(body);

    // 4 word labels — positioned at TL/TR/BR/BL corners of the card's bounding box.
    const corners = ['tl', 'tr', 'br', 'bl'];
    for (let edge = 0; edge < 4; edge++) {
        const wIdx = ((edge - (petal.rotation || 0)) % 4 + 4) % 4;
        const w = document.createElement('div');
        w.className = 'petal-word petal-word-' + corners[edge];
        w.textContent = petal.words[wIdx];
        card.appendChild(w);
    }

    // Center: id label + rotate button
    const center = document.createElement('div');
    center.className = 'petal-center';
    const idLab = document.createElement('div');
    idLab.className = 'petal-id';
    idLab.textContent = '#' + (petal.id + 1);
    center.appendChild(idLab);
    if (opts.interactive !== false && typeof opts.onRotate === 'function') {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'petal-rotate';
        btn.title = 'Rotate';
        btn.setAttribute('aria-label', 'Rotate petal');
        btn.textContent = '↻';
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            opts.onRotate(petal);
        });
        center.appendChild(btn);
    }
    card.appendChild(center);

    return card;
};

window.refreshPetalCard = function refreshPetalCard(node, petal) {
    const rot = petal.rotation || 0;
    node.dataset.rotation = String(rot);
    const corners = ['tl', 'tr', 'br', 'bl'];
    for (let edge = 0; edge < 4; edge++) {
        const wIdx = ((edge - rot) % 4 + 4) % 4;
        const w = node.querySelector('.petal-word-' + corners[edge]);
        if (w) w.textContent = petal.words[wIdx];
    }
    // The rotate-icon visually tracks petal.rotation (90° per click) so it
    // doesn't snap back to its original orientation after a click-rotation.
    const rotIcon = node.querySelector('.petal-rotate-icon');
    if (rotIcon) {
        rotIcon.style.transform = `translate(-50%, -50%) rotate(${rot * 90}deg)`;
    }
    window.fitCardWords(node);
};

// Shrink a single petal-word's font-size until it fits on one line.
// (.petal-word has white-space:nowrap so without this it would clip.)
window.fitWord = function fitWord(el) {
    if (!el || !el.isConnected) return;
    el.style.fontSize = '';   // reset so we measure the CSS-default size
    const avail = el.clientWidth - 4; // small safety margin
    if (avail <= 0) return;
    const natural = el.scrollWidth;
    if (natural <= avail) return;
    const cur = parseFloat(getComputedStyle(el).fontSize) || 14;
    const next = Math.max(7, cur * (avail / natural) * 0.97);
    el.style.fontSize = next + 'px';
    // One refinement pass in case the initial estimate was off.
    if (el.scrollWidth > avail) {
        const cur2 = parseFloat(getComputedStyle(el).fontSize) || next;
        el.style.fontSize = Math.max(7, cur2 * (avail / el.scrollWidth) * 0.97) + 'px';
    }
};

window.fitCardWords = function fitCardWords(cardNode) {
    if (!cardNode) return;
    cardNode.querySelectorAll('.petal-word').forEach(window.fitWord);
};

window.fitAllPetalWords = function fitAllPetalWords(root) {
    (root || document).querySelectorAll('.petal-word').forEach(window.fitWord);
};
