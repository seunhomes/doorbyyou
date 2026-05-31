/* ============================================================
   PANES — Windows catalog + renderer
   Vinyl / aluminum replacement windows. Representative demo data;
   rendered as CSS/SVG frames + glass (simple geometry).
   ============================================================ */
(function () {
  const FIN = window.PANES.FINISHES;

  const WINDOWS = [
    { name: 'Double Hung',  type: 'Hung',     price: 312, finish: 'white',  desc: 'Two operating sashes that tilt in for easy cleaning — the all-purpose classic.' },
    { name: 'Single Hung',  type: 'Hung',     price: 268, finish: 'white',  desc: 'Fixed top sash with a lifting bottom sash. Clean lines, value pricing.' },
    { name: 'Casement',     type: 'Casement', price: 396, finish: 'black',  desc: 'Side-hinged sash on a fold-away crank for maximum ventilation and a tight seal.' },
    { name: 'Awning',       type: 'Casement', price: 358, finish: 'black',  desc: 'Top-hinged sash that opens outward — vents even in light rain.' },
    { name: 'Slider',       type: 'Slider',   price: 342, finish: 'iron',   desc: 'Horizontal gliding sash on a low-profile track. Great for wide openings.' },
    { name: 'Picture',      type: 'Fixed',    price: 286, finish: 'white',  desc: 'A fixed, frameless-look pane for an uninterrupted view and the most glass.' },
    { name: 'Bay',          type: 'Special',  price: 1240, finish: 'white', desc: 'Three-panel projection that adds light, depth and a built-in sill.' },
    { name: 'Bow',          type: 'Special',  price: 1480, finish: 'white', desc: 'Gentle four-panel curve that wraps the view in a soft radius.' },
  ];

  const WW = 200, WH = 230;

  /* ---- configurator options ---- */
  const WINCONFIG = {
    frames: [
      { label: 'Vinyl',    mult: 1.00, desc: 'Multi-chamber fusion-welded vinyl. Maintenance-free and the best value.' },
      { label: 'Aluminum', mult: 1.28, desc: 'Slim, strong thermally-broken aluminum frames for a modern look.' },
    ],
    sizes: [
      { label: `24" × 36"`, mult: 0.78 },
      { label: `36" × 48"`, mult: 1.00 },
      { label: `36" × 60"`, mult: 1.20 },
      { label: `48" × 60"`, mult: 1.46 },
      { label: `60" × 72"`, mult: 1.82 },
    ],
    finishKeys: ['white', 'black', 'iron', 'bronze', 'oak'],
    grids: [
      { label: 'None',     add: 0,  kind: null },
      { label: 'Colonial', add: 60, kind: 'colonial' },
      { label: 'Prairie',  add: 70, kind: 'prairie' },
      { label: 'Diamond',  add: 95, kind: 'diamond' },
    ],
    glass: [
      { label: 'Clear Low-E', add: 0,   tint: null },
      { label: 'Obscure',     add: 70,  tint: 'frost' },
      { label: 'Tinted',      add: 90,  tint: 'tint' },
      { label: 'Tempered',    add: 110, tint: null },
    ],
    interior: [
      { label: 'White',          sw: '#f4f3ef' },
      { label: 'Tan',            sw: '#d8cbb4' },
      { label: 'Match exterior', sw: null },
    ],
    screens: [
      { label: 'Standard screen', add: 0 },
      { label: 'No screen',       add: -25 },
      { label: 'Pet-proof screen', add: 45 },
    ],
  };
  function defaultWinSel(w) {
    let fin = WINCONFIG.finishKeys.indexOf(w.finish); if (fin < 0) fin = 0;
    return { frame: 0, size: 1, finish: fin, grid: 0, glass: 0, interior: 0, screen: 0 };
  }
  function computeWinPrice(w, sel) {
    if (!sel) return w.price;
    const base = w.price * WINCONFIG.frames[sel.frame].mult * WINCONFIG.sizes[sel.size].mult;
    return base + WINCONFIG.grids[sel.grid].add + WINCONFIG.glass[sel.glass].add + WINCONFIG.screens[sel.screen].add;
  }
  function winSpecs(w) {
    return [
      ['Type', w.type + ' window'],
      ['Glass', 'Dual-pane Low-E, argon-filled'],
      ['Frame', 'Fusion-welded, multi-chamber'],
      ['U-factor', '≈ 0.27 · ENERGY STAR rated'],
      ['Screen', 'Full or half, fiberglass mesh'],
      ['Operation', w.type === 'Fixed' ? 'Fixed (non-operating)' : 'Tilt-in / smooth glide'],
      ['Warranty', 'Lifetime limited · transferable'],
    ];
  }

  /* grid (muntin) overlay clipped to the glazing area */
  function gridOverlay(uid, kind, col) {
    if (!kind) return '';
    const x = 16, y = 16, w = WW - 32, h = WH - 32;
    const line = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="3"/>`;
    let s = '';
    if (kind === 'colonial') {
      s += line(x + w / 2, y, x + w / 2, y + h);
      for (let j = 1; j < 3; j++) s += line(x, y + h * j / 3, x + w, y + h * j / 3);
    } else if (kind === 'prairie') {
      const ix = w * 0.16, iy = h * 0.16;
      s += line(x + ix, y, x + ix, y + h) + line(x + w - ix, y, x + w - ix, y + h);
      s += line(x, y + iy, x + w, y + iy) + line(x, y + h - iy, x + w, y + h - iy);
    } else if (kind === 'diamond') {
      const step = 34;
      for (let d = -h; d < w + h; d += step) { s += line(x + d, y, x + d - h, y + h); s += line(x + d, y, x + d + h, y + h); }
    }
    return `<g clip-path="url(#wc-${uid})">${s}</g>`;
  }

  function frameRect(x, y, w, h, col, sw) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${col}" stroke-width="${sw}"/>`;
  }
  function glass(x, y, w, h, uid, op = 0.55) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#wg-${uid})" opacity="${op}"/>
      <polygon points="${x},${y+h*0.6} ${x+w*0.5},${y} ${x+w*0.78},${y} ${x},${y+h*0.95}" fill="rgba(255,255,255,.22)"/>`;
  }

  function windowSVG(w, finishKey, sel) {
    const f = FIN[finishKey || w.finish] || FIN.white;
    const frame = f.stops[2], frameLo = f.stops[3];
    const uid = 'w' + Math.random().toString(36).slice(2, 7);
    const gridKind = sel ? WINCONFIG.grids[sel.grid].kind : null;
    const tint = sel ? WINCONFIG.glass[sel.glass].tint : null;
    let body = '';
    const G = (x, y, ww, hh, op) => glass(x, y, ww, hh, uid, op);

    if (w.type === 'Hung') {
      body += G(18, 18, WW - 36, (WH - 36) / 2 - 3);
      body += G(18, 18 + (WH - 36) / 2 + 3, WW - 36, (WH - 36) / 2 - 3);
      body += frameRect(18, 18, WW - 36, (WH - 36) / 2 - 3, frameLo, 4);
      body += frameRect(18, 18 + (WH - 36) / 2 + 3, WW - 36, (WH - 36) / 2 - 3, frameLo, 4);
      body += `<rect x="14" y="${18 + (WH - 36) / 2 - 4}" width="${WW - 28}" height="9" fill="${frame}"/>`;
    } else if (w.type === 'Casement') {
      body += G(18, 18, WW - 36, WH - 36);
      body += frameRect(22, 22, WW - 44, WH - 44, frameLo, 3);
      // crank handle hint at bottom
      body += `<rect x="${WW/2-10}" y="${WH-16}" width="20" height="5" rx="2.5" fill="${frame}"/>`;
      if (w.name === 'Awning') body += `<path d="M18 18 L${WW/2} 30 L${WW-18} 18" fill="none" stroke="${frameLo}" stroke-width="2" opacity=".5"/>`;
    } else if (w.type === 'Slider') {
      body += G(18, 18, (WW - 36) / 2 - 2, WH - 36);
      body += G(18 + (WW - 36) / 2 + 2, 18, (WW - 36) / 2 - 2, WH - 36);
      body += frameRect(18, 18, (WW - 36) / 2 - 2, WH - 36, frameLo, 4);
      body += frameRect(18 + (WW - 36) / 2 + 2, 18, (WW - 36) / 2 - 2, WH - 36, frameLo, 4);
      body += `<rect x="${18 + (WW - 36) / 2 - 2}" y="14" width="9" height="${WH - 28}" fill="${frame}"/>`;
    } else if (w.type === 'Fixed') {
      body += G(16, 16, WW - 32, WH - 32, 0.5);
    } else if (w.type === 'Special') {
      // 3-panel bay/bow projection
      const pw = (WW - 24) / 3;
      for (let i = 0; i < 3; i++) {
        const x = 12 + i * pw;
        const inset = i === 1 ? 0 : 10;   // outer panels angled back
        body += `<polygon points="${x},${18+ (i===1?0:6)} ${x+pw-3},${18 + (i===0?6:i===2?0:0)} ${x+pw-3},${WH-18 - (i===2?6:0)} ${x},${WH-18 - (i===0?6:0)}" fill="url(#wg-${uid})" opacity=".5"/>`;
        body += `<polygon points="${x},${18+(i===1?0:6)} ${x+pw-3},${18+(i===0?6:0)} ${x+pw-3},${WH-18-(i===2?6:0)} ${x},${WH-18-(i===0?6:0)}" fill="none" stroke="${frameLo}" stroke-width="3"/>`;
      }
    }

    const tintRect = tint === 'frost'
      ? `<rect x="16" y="16" width="${WW-32}" height="${WH-32}" fill="#fff" opacity=".34"/>`
      : tint === 'tint'
      ? `<rect x="16" y="16" width="${WW-32}" height="${WH-32}" fill="#1d2b33" opacity=".22"/>` : '';

    return `
    <svg class="door-svg" viewBox="-12 -12 ${WW+24} ${WH+30}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <linearGradient id="wg-${uid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#d2dcde"/><stop offset=".5" stop-color="#b0c1c6"/><stop offset="1" stop-color="#c8d4d6"/></linearGradient>
        <linearGradient id="wfl-${uid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="rgba(0,0,0,.1)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></linearGradient>
        <clipPath id="wc-${uid}"><rect x="16" y="16" width="${WW-32}" height="${WH-32}"/></clipPath>
      </defs>
      <rect x="6" y="8" width="${WW}" height="${WH}" rx="2" fill="rgba(0,0,0,.12)"/>
      <rect x="0" y="0" width="${WW}" height="${WH}" rx="2" fill="${f.stops[1]}"/>
      <rect x="8" y="8" width="${WW-16}" height="${WH-16}" fill="${f.stops[0]}"/>
      ${body}
      ${tintRect}
      ${gridOverlay(uid, gridKind, frameLo)}
      <rect x="0" y="0" width="${WW}" height="${WH}" rx="2" fill="none" stroke="${frameLo}" stroke-width="8"/>
      <ellipse cx="${WW/2}" cy="${WH+12}" rx="${WW/2}" ry="7" fill="url(#wfl-${uid})"/>
    </svg>`;
  }

  window.PANES.WINDOWS = WINDOWS;
  window.PANES.WINCONFIG = WINCONFIG;
  window.PANES.windowSVG = windowSVG;
  window.PANES.defaultWinSel = defaultWinSel;
  window.PANES.computeWinPrice = computeWinPrice;
  window.PANES.winSpecs = winSpecs;
})();
