/* ============================================================
   PANES — Entry Doors catalog
   Catalog data (real names / styles / prices) + CSS-art door renderer.
   No external photos are used — each door slab is drawn with CSS
   from its groove pattern so the grid reads like a real door catalog.
   ============================================================ */

/* ---- Finish swatches: realistic painted / stained door faces ---- */
const FINISHES = {
  black:   { label: 'Matte Black',  swatch: '#222224', stops: ['#34343680','#2b2b2d','#202022','#141416'], groove: 'rgba(0,0,0,.6)',  high: 'rgba(255,255,255,.07)', text: '#fff', filter: 'grayscale(1) brightness(.34) contrast(1.15)' },
  white:   { label: 'Snow White',   swatch: '#ecebe4', stops: ['#faf9f5','#f1f0ea','#e7e6df','#dad8d0'], groove: 'rgba(0,0,0,.17)', high: 'rgba(255,255,255,.85)', text: '#222', filter: 'grayscale(1) brightness(1.8) contrast(.82)' },
  iron:    { label: 'Iron Grey',    swatch: '#5b5d61', stops: ['#7a7c80','#6a6c70','#5a5c60','#48494d'], groove: 'rgba(0,0,0,.42)', high: 'rgba(255,255,255,.14)', text: '#fff', filter: 'grayscale(1) brightness(.82) contrast(1.05)' },
  bronze:  { label: 'Dark Bronze',  swatch: '#3a3128', stops: ['#564a3e','#463b30','#382f26','#29221c'], groove: 'rgba(0,0,0,.45)', high: 'rgba(255,255,255,.08)', text: '#fff', filter: 'sepia(1) saturate(1.5) hue-rotate(-12deg) brightness(.62) contrast(1.05)' },
  oak:     { label: 'Natural Oak',  swatch: '#b9854b', stops: ['#d2a973','#c2945a','#b07c45','#9a6c39'], groove: 'rgba(76,46,18,.5)',  high: 'rgba(255,247,233,.24)', text: '#3a2a14', grain: true, filter: 'none' },
  walnut:  { label: 'Walnut Stain', swatch: '#583620', stops: ['#7a5232','#654227','#523320','#3d2616'], groove: 'rgba(20,10,2,.55)',  high: 'rgba(255,235,205,.15)', text: '#f3e6d6', grain: true, filter: 'sepia(1) saturate(1.7) hue-rotate(-18deg) brightness(.5) contrast(1.05)' },
  sage:    { label: 'Sage Green',   swatch: '#6b735f', stops: ['#8a917d','#79806b','#69715b','#57604c'], groove: 'rgba(0,0,0,.34)', high: 'rgba(255,255,255,.13)', text: '#fff', filter: 'grayscale(1) sepia(1) hue-rotate(50deg) saturate(.55) brightness(.92)' },
};

/* ---- The catalog: doorbyyou woodgrain entry-door designs (oak finish renders) ---- */
const DOORS = [
  { name: 'Chevron',       material: 'Fiberglass', style: 'Contemporary', price: 2454, pattern: 'chevron',     finish: 'oak', image: 'images/doors/chevron.jpg',       desc: 'Bold mirrored chevron grooves across a warm oak woodgrain slab.' },
  { name: 'Chevron Boxed', material: 'Fiberglass', style: 'Contemporary', price: 2505, pattern: 'chevron',     finish: 'oak', image: 'images/doors/chevron-boxed.jpg', desc: 'Chevron pattern framed within a clean boxed border for added structure.' },
  { name: 'Herringbone',   material: 'Fiberglass', style: 'Traditional',  price: 2913, pattern: 'herringbone', finish: 'oak', image: 'images/doors/herringbone.jpg',   desc: 'Classic herringbone groovework in a rich oak woodgrain.' },
  { name: 'Parquet',       material: 'Fiberglass', style: 'Traditional',  price: 2999, pattern: 'herringbone', finish: 'oak', image: 'images/doors/parquet.jpg',       desc: 'Interlocking parquet blocks for a tailored, heritage look.' },
  { name: 'Envelope',      material: 'Fiberglass', style: 'Modern',       price: 2607, pattern: 'abstract',    finish: 'oak', image: 'images/doors/envelope.jpg',      desc: 'Crossed diagonals fold the slab into a striking envelope motif.' },
  { name: 'Arrow',         material: 'Fiberglass', style: 'Modern',       price: 2454, pattern: 'chevron',     finish: 'oak', image: 'images/doors/arrow.jpg',         desc: 'Directional arrow grooves give this oak door confident movement.' },
  { name: 'Two Way',       material: 'Fiberglass', style: 'Contemporary', price: 2556, pattern: 'chevron',     finish: 'oak', image: 'images/doors/two-way.jpg',       desc: 'Opposing groove fields meet at a crisp two-way centre line.' },
  { name: 'Mosaic',        material: 'Fiberglass', style: 'Contemporary', price: 3100, pattern: 'grid',        finish: 'oak', image: 'images/doors/mosaic.jpg',        desc: 'A composed grid of grooved tiles for a refined mosaic face.' },
  { name: 'Address',       material: 'Fiberglass', style: 'Traditional',  price: 3600, pattern: 'hVaried',     finish: 'oak', image: 'images/doors/address.jpg',       desc: 'Personalised house-number engraving above a stepped groove field.' },
  { name: 'Craft',         material: 'Fiberglass', style: 'Traditional',  price: 2862, pattern: 'sixPanel',    finish: 'oak', image: 'images/doors/craft.jpg',         desc: 'Craftsman-inspired panelled composition in warm oak.' },
  { name: 'Duo',           material: 'Fiberglass', style: 'Modern',       price: 2301, pattern: 'twoPanel',    finish: 'oak', image: 'images/doors/duo.jpg',           desc: 'Two clean panels split the slab for a balanced modern look.' },
  { name: 'Plank',         material: 'Fiberglass', style: 'Modern',       price: 2250, pattern: 'plank',       finish: 'oak', image: 'images/doors/plank.jpg',         desc: 'Vertical plank grooves for a clean, contemporary entrance.' },
  { name: 'Busy Plank',    material: 'Fiberglass', style: 'Contemporary', price: 2403, pattern: 'plank',       finish: 'oak', image: 'images/doors/busy-plank.jpg',    desc: 'Densely spaced plank grooves add rhythm and fine detail.' },
  { name: 'Full Step',     material: 'Fiberglass', style: 'Contemporary', price: 2403, pattern: 'hChannel',    finish: 'oak', image: 'images/doors/full-step.jpg',     desc: 'Full-width stepped channels march down the oak slab.' },
  { name: 'Half Step',     material: 'Fiberglass', style: 'Contemporary', price: 2352, pattern: 'hVaried',     finish: 'oak', image: 'images/doors/half-step.jpg',     desc: 'Offset half-step grooves for a quietly dynamic surface.' },
  { name: 'Odd',           material: 'Fiberglass', style: 'Modern',       price: 2352, pattern: 'abstract',    finish: 'oak', image: 'images/doors/odd.jpg',           desc: 'An off-beat asymmetric groove layout for a design-forward entry.' },
  { name: 'Mild',          material: 'Fiberglass', style: 'Modern',       price: 2199, pattern: 'hLines',      finish: 'oak', image: 'images/doors/mild.jpg',          desc: 'Understated horizontal lines for a soft, minimal statement.' },
  { name: 'Even',          material: 'Fiberglass', style: 'Modern',       price: 2199, pattern: 'hLines',      finish: 'oak', image: 'images/doors/even.jpg',          desc: 'Evenly spaced horizontal grooves — calm, linear and modern.' },
];

/* ============================================================
   Door renderer — builds an inline-SVG door slab for a pattern.
   Everything is simple geometry (lines / rects / arcs): original
   CSS/SVG art, not a reproduction of any photograph.
   ============================================================ */

const DW = 200, DH = 470; // slab coordinate space

function grooveLines(coords, stroke, sw = 3) {
  return coords.map(([x1, y1, x2, y2]) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"/>`
  ).join('');
}
function panelRect(x, y, w, h, stroke, r = 4) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${stroke}" stroke-width="3"/>`;
}

function patternSVG(pattern, g, hi) {
  // g = groove (shadow) color, hi = highlight color. Most grooves draw a
  // shadow line plus a 1px highlight just below for a chamfered look.
  const P = 22, R = DW - 22, top = 26, bot = DH - 26;
  const H = (ys) => ys.map(y => grooveLines([[P, y, R, y]], g, 4) + grooveLines([[P, y + 3, R, y + 3]], hi, 1.5)).join('');
  const V = (xs) => xs.map(x => grooveLines([[x, top, x, bot]], g, 4) + grooveLines([[x + 3, top, x + 3, bot]], hi, 1.5)).join('');
  switch (pattern) {
    case 'flush':      return '';
    case 'vGroove4':   return V([60, 90, 120, 150]);
    case 'vGroove3off':return V([70, 95, 120]) + H([330]);
    case 'vChannel':   return V([55, 85, 115, 145]).replace(/stroke-width="4"/g, 'stroke-width="7"');
    case 'vChannel2':  return V([50, 78, 106, 134, 162]).replace(/stroke-width="4"/g, 'stroke-width="6"');
    case 'plank':      return V([44, 66, 88, 110, 132, 154, 176]);
    case 'hChannel':   return H([90, 140, 190, 240, 290, 340, 390]).replace(/stroke-width="4"/g, 'stroke-width="7"');
    case 'hLines':     return H([110, 160, 210, 260, 310, 360]);
    case 'hTriple':    return H([180, 215, 250]);
    case 'hVaried':    return H([80, 120, 175, 250, 345]);
    case 'hRefined':   return H([90, 130, 170, 300, 340, 380]);
    case 'hFlow':      return H([100, 150, 205, 265, 330]);
    case 'hRound':     return H([130, 185, 240, 295, 350]).replace(/stroke-width="4"/g, 'stroke-width="8"');
    case 'rhythm':     return H([90, 110, 165, 220, 240, 300, 355, 375]);
    case 'hCurve':     return [120, 200, 280].map(y =>
                          `<path d="M${P} ${y} Q${DW/2} ${y - 26} ${R} ${y}" fill="none" stroke="${g}" stroke-width="4"/>`
                          + `<path d="M${P} ${y+3} Q${DW/2} ${y - 23} ${R} ${y+3}" fill="none" stroke="${hi}" stroke-width="1.5"/>`).join('');
    case 'offset':     return grooveLines([[P,120,120,120],[80,200,R,200],[P,300,150,300]], g, 5);
    case 'abstract':   return grooveLines([[P,110,140,110],[110,110,110,260],[60,260,R,260],[150,260,150,bot],[P,360,150,360]], g, 4);
    case 'mixGroove':  return V([70, 100]) + H([250, 290, 330, 370]);
    case 'grid':       return V([66, 110, 154]) + H([130, 215, 300, 385]);
    case 'chevron':    return [70,140,210,280,350].map(y =>
                          `<path d="M${P} ${y} L${DW/2} ${y-26} L${R} ${y}" fill="none" stroke="${g}" stroke-width="4" stroke-linejoin="round"/>`).join('');
    case 'herringbone':{ let s=''; for(let y=50;y<bot;y+=46){ s+=`<path d="M${P} ${y} L${DW/2} ${y-22} L${R} ${y}" fill="none" stroke="${g}" stroke-width="3"/>`; } return s; }
    case 'organic':    return [70,130,195,260,325,385].map((y,i)=>
                          `<path d="M${P} ${y} C70 ${y-14},130 ${y+14},${R} ${y - (i%2?8:-8)}" fill="none" stroke="${g}" stroke-width="3.5"/>`).join('');
    case 'twoPanel':   return panelRect(40, 40, 120, 180, g) + panelRect(40, 250, 120, 180, g);
    case 'sixPanel':   return [40,170].flatMap(y=>[panelRect(34,y,58,120,g),panelRect(108,y,58,120,g)]).join('')
                          + panelRect(34, 310, 132, 120, g);
    case 'fourPanelR': return [[34,40],[108,40],[34,250],[108,250]].map(([x,y])=>panelRect(x,y,58,180,g)).join('');
    case 'curved3':    return panelRect(40,250,120,180,g) + panelRect(40,150,120,80,g)
                          + `<path d="M40 90 Q100 40 160 90 L160 130 L40 130 Z" fill="none" stroke="${g}" stroke-width="3"/>`;
    case 'medallion':  return panelRect(36,300,128,130,g) + panelRect(36,210,128,70,g)
                          + `<ellipse cx="100" cy="120" rx="56" ry="74" fill="none" stroke="${g}" stroke-width="3"/>`
                          + `<ellipse cx="100" cy="120" rx="34" ry="50" fill="none" stroke="${g}" stroke-width="2.5"/>`
                          + grooveLines([[100,46,100,194],[44,120,156,120]], g, 2);
    default:           return H([130, 215, 300]);
  }
}

/* Build the full door "scene": studio wall + frame + slab + glass + handle */
let _sceneSeq = 0;
function doorSceneHTML(d, opts = {}) {
  if (d.image) {
    const ff = (FINISHES[d.finish] || {}).filter || 'none';
    return `<img class="door-svg door-photo" src="${d.image}" alt="${d.name} entry door" loading="lazy" style="filter:${ff}" />`;
  }
  const f = FINISHES[d.finish] || FINISHES.black;
  const uid = 'dr' + (_sceneSeq++);
  const st = f.stops;
  const faceGrad = `<linearGradient id="face-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${st[0]}"/><stop offset=".42" stop-color="${st[1]}"/>
      <stop offset=".72" stop-color="${st[2]}"/><stop offset="1" stop-color="${st[3]}"/></linearGradient>`;
  const grain = f.grain
    ? `<rect x="0" y="0" width="${DW}" height="${DH}" fill="url(#grain-${uid})"/>` : '';
  const grooves = patternSVG(d.pattern, f.groove, f.high);
  const handle = opts.noHandle ? '' :
    `<rect x="${DW-20}" y="${DH/2-26}" width="6" height="52" rx="3" fill="rgba(0,0,0,.35)"/>
     <rect x="${DW-19}" y="${DH/2-25}" width="2.5" height="50" rx="2" fill="rgba(255,255,255,.25)"/>`;
  return `
  <svg class="door-svg" viewBox="-46 -20 ${DW+92} ${DH+40}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs>
      <pattern id="grain-${uid}" width="3" height="${DH}" patternUnits="userSpaceOnUse">
        <rect width="3" height="${DH}" fill="rgba(0,0,0,0)"/>
        <line x1="1" y1="0" x2="1" y2="${DH}" stroke="rgba(0,0,0,.05)" stroke-width="1"/>
      </pattern>
      ${faceGrad}
      <linearGradient id="floor-${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="rgba(0,0,0,.12)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/>
      </linearGradient>
    </defs>
    <!-- frame / casing -->
    <rect x="-34" y="-10" width="${DW+68}" height="${DH+24}" rx="3" fill="rgba(0,0,0,.05)"/>
    <rect x="-20" y="-4" width="${DW+40}" height="${DH+12}" rx="2" fill="#fbfaf6" stroke="rgba(0,0,0,.08)" stroke-width="1"/>
    <!-- slab shadow -->
    <rect x="6" y="8" width="${DW}" height="${DH}" rx="3" fill="rgba(0,0,0,.16)"/>
    <!-- slab face -->
    <rect x="0" y="0" width="${DW}" height="${DH}" rx="3" fill="url(#face-${uid})"/>
    ${grain}
    <rect x="0" y="0" width="${DW}" height="${DH}" rx="3" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1.5"/>
    ${grooves}
    ${handle}
    <!-- soft floor reflection -->
    <ellipse cx="${DW/2}" cy="${DH+18}" rx="${DW/2+10}" ry="10" fill="url(#floor-${uid})"/>
  </svg>`;
}

/* ============================================================
   Configurator options + pricing (shared across pages)
   ============================================================ */
const CONFIG = {
  sizes: [
    { label: `32" × 6'8"`, w: 32, h: 80, mult: 1.00 },
    { label: `36" × 6'8"`, w: 36, h: 80, mult: 1.06 },
    { label: `36" × 8'`,   w: 36, h: 96, mult: 1.22 },
    { label: `42" × 8'`,   w: 42, h: 96, mult: 1.34 },
    { label: `Double 72" × 8'`, w: 72, h: 96, mult: 1.95, dbl: true },
  ],
  finishKeys: ['black', 'white', 'iron', 'bronze', 'oak', 'walnut', 'sage'],
  glass: [
    { label: 'Solid (no glass)', add: 0,   tint: null },
    { label: 'Clear Lite',       add: 380, tint: 'clear' },
    { label: 'Sandblasted',      add: 520, tint: 'frost' },
    { label: 'Rain',             add: 560, tint: 'rain' },
    { label: 'Decorative Iron',  add: 740, tint: 'iron' },
  ],
  sidelites: [
    { label: 'None',            add: 0,    sides: 0, w: 0 },
    { label: 'One side · 12"',  add: 690,  sides: 1, w: 12 },
    { label: 'Both sides · 12"',add: 1280, sides: 2, w: 12 },
    { label: 'Both sides · 14"',add: 1480, sides: 2, w: 14 },
  ],
  transoms: [
    { label: 'None',        add: 0,   h: 0 },
    { label: 'Rectangular', add: 540, h: 14 },
    { label: 'Arched',      add: 760, h: 18, arch: true },
  ],
  handles: [
    { label: 'Tubular Pull · 48"', add: 0,   sku: 'H-TP48' },
    { label: 'Square Lever Set',   add: 120, sku: 'H-SQL' },
    { label: 'Modern Bar · 60"',   add: 240, sku: 'H-MB60' },
    { label: 'Entry Set + Deadbolt', add: 180, sku: 'H-ESD' },
  ],
  hinges: [
    { label: 'Satin Nickel',     add: 0,  swatch: '#b9bcc0' },
    { label: 'Matte Black',      add: 40, swatch: '#222224' },
    { label: 'Oil-Rubbed Bronze',add: 55, swatch: '#3a2f25' },
    { label: 'Polished Brass',   add: 60, swatch: '#b9924a' },
  ],
};

/* Default selection object for a door */
function defaultSel(door) {
  let fin = CONFIG.finishKeys.indexOf(door.finish); if (fin < 0) fin = 0;
  return { size: 1, finish: fin, glass: 0, sidelite: 0, transom: 0, handle: 0, hinge: 0 };
}

/* Total configured price for a door + selection */
function computePrice(door, s) {
  const base = door.price * CONFIG.sizes[s.size].mult;
  const extras = CONFIG.glass[s.glass].add + CONFIG.sidelites[s.sidelite].add
    + CONFIG.transoms[s.transom].add + CONFIG.handles[s.handle].add + CONFIG.hinges[s.hinge].add;
  return base + extras;
}

/* Key spec table rows for a door */
function specsFor(door) {
  return [
    ['Material', door.material === 'Steel' ? '24-gauge galvanized steel' : 'Smooth fiberglass (FRP) skin'],
    ['Core', 'Polyurethane foam · R-value ≈ 11'],
    ['Edge', 'Composite stile & rail, no-rot bottom'],
    ['Thickness', '1¾" (44 mm) slab'],
    ['Lock prep', 'Multi-point lock, 3-point standard'],
    ['Hinges', '4" ball-bearing, finish to match hardware'],
    ['Weatherstrip', 'Q-lon compression seal, all sides'],
    ['Glass', 'Low-E argon, lifetime seal warranty'],
    ['Finish', 'Factory paint or stain, inside & out'],
    ['Warranty', 'Lifetime limited · transferable'],
  ];
}

/* ============================================================
   Glass tint helpers
   ============================================================ */
function glassDefs(uid) {
  return `
    <linearGradient id="gl-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#cdd8da"/><stop offset=".5" stop-color="#aebfc4"/><stop offset="1" stop-color="#c4d0d2"/>
    </linearGradient>`;
}
function glassFill(tint, uid) {
  if (!tint) return null;
  return `url(#gl-${uid})`;
}
function glassPanel(x, y, w, h, tint, uid, mullions) {
  if (!tint) return '';
  let inner = '';
  const op = tint === 'frost' ? 0.92 : tint === 'rain' ? 0.8 : 0.6;
  inner += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#gl-${uid})" opacity="${op}"/>`;
  // light streak
  inner += `<polygon points="${x},${y+h*0.55} ${x+w*0.5},${y} ${x+w*0.8},${y} ${x},${y+h*0.9}" fill="rgba(255,255,255,.25)"/>`;
  if (tint === 'rain') { for (let yy = y + 8; yy < y + h; yy += 10) inner += `<line x1="${x}" y1="${yy}" x2="${x+w}" y2="${yy}" stroke="rgba(255,255,255,.18)" stroke-width="2"/>`; }
  if (tint === 'iron') {
    inner += `<line x1="${x+w/2}" y1="${y}" x2="${x+w/2}" y2="${y+h}" stroke="rgba(30,30,30,.6)" stroke-width="3"/>`;
    for (let yy = y + h/4; yy < y + h; yy += h/4) inner += `<line x1="${x}" y1="${yy}" x2="${x+w}" y2="${yy}" stroke="rgba(30,30,30,.55)" stroke-width="3"/>`;
  }
  if (mullions) for (let yy = y + h/3; yy < y + h - 4; yy += h/3) inner += `<line x1="${x}" y1="${yy}" x2="${x+w}" y2="${yy}" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>`;
  inner += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="2"/>`;
  return inner;
}

/* ============================================================
   Full unit renderer — door + optional sidelites + transom.
   Used by the detail page and standalone configurator.
   ============================================================ */
function unitSVG(door, sel, opts) {
  opts = opts || {};
  const f = FINISHES[door.finish] || FINISHES.black;
  const fin = sel && sel.finish != null ? FINISHES[CONFIG.finishKeys[sel.finish]] : f;
  const uid = 'u' + (_sceneSeq++);
  const st = fin.stops;
  const sl = CONFIG.sidelites[sel ? sel.sidelite : 0];
  const tr = CONFIG.transoms[sel ? sel.transom : 0];
  const gl = CONFIG.glass[sel ? sel.glass : 0];
  const hinge = CONFIG.hinges[sel ? sel.hinge : 0];

  const slW = sl.sides ? 64 : 0;       // sidelite render width
  const gap = sl.sides ? 10 : 0;
  const leftS = sl.sides >= 1, rightS = sl.sides >= 2;
  const doorX = (leftS ? slW + gap : 0);
  const totalW = doorX + DW + (rightS ? gap + slW : 0);
  const trH = tr.h ? 70 : 0;
  const topY = trH ? trH + 12 : 0;
  const totalH = topY + DH;

  const faceGrad = `<linearGradient id="face-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${st[0]}"/><stop offset=".42" stop-color="${st[1]}"/>
      <stop offset=".72" stop-color="${st[2]}"/><stop offset="1" stop-color="${st[3]}"/></linearGradient>`;
  const grainDef = `<pattern id="grain-${uid}" width="3" height="${DH}" patternUnits="userSpaceOnUse">
      <line x1="1" y1="0" x2="1" y2="${DH}" stroke="rgba(0,0,0,.05)" stroke-width="1"/></pattern>`;

  // door slab
  const grooves = patternSVG(door.pattern, fin.groove, fin.high);
  const grain = fin.grain ? `<rect x="0" y="0" width="${DW}" height="${DH}" fill="url(#grain-${uid})"/>` : '';
  // glass cut into door (centre upper third) when glass selected & not a panel-style door
  const doorGlass = gl.tint ? glassPanel(46, 40, DW - 92, 150, gl.tint, uid, true) : '';
  const handleColor = hinge.swatch;

  let frames = '';
  // transom
  if (tr.h) {
    if (tr.arch) {
      frames += `<path d="M0 ${trH} L0 26 Q${totalW/2} ${-18} ${totalW} 26 L${totalW} ${trH} Z" fill="#fbfaf6" stroke="rgba(0,0,0,.14)" stroke-width="2"/>`;
      frames += `<path d="M10 ${trH-6} L10 30 Q${totalW/2} ${-6} ${totalW-10} 30 L${totalW-10} ${trH-6} Z" fill="url(#gl-${uid})" opacity=".6"/>`;
    } else {
      frames += `<rect x="0" y="0" width="${totalW}" height="${trH}" rx="2" fill="#fbfaf6" stroke="rgba(0,0,0,.14)" stroke-width="2"/>`;
      frames += glassPanel(8, 8, totalW - 16, trH - 16, gl.tint || 'clear', uid, false);
    }
  }
  // sidelites
  function sidelite(x) {
    let s = `<rect x="${x}" y="${topY}" width="${slW}" height="${DH}" rx="2" fill="#fbfaf6" stroke="rgba(0,0,0,.14)" stroke-width="2"/>`;
    s += glassPanel(x + 8, topY + 10, slW - 16, DH - 20, gl.tint || 'frost', uid, true);
    return s;
  }
  if (leftS) frames += sidelite(0);
  if (rightS) frames += sidelite(doorX + DW + gap);

  return `
  <svg class="door-svg unit" viewBox="-20 ${trH ? -24 : -14} ${totalW + 40} ${totalH + 34}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs>${faceGrad}${grainDef}${glassDefs(uid)}
      <linearGradient id="floor-${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="rgba(0,0,0,.12)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></linearGradient>
    </defs>
    ${frames}
    <!-- door group -->
    <g transform="translate(${doorX}, ${topY})">
      <rect x="6" y="8" width="${DW}" height="${DH}" rx="3" fill="rgba(0,0,0,.16)"/>
      ${opts.bare ? '' : `<rect x="-12" y="-6" width="${DW+24}" height="${DH+10}" rx="2" fill="#fbfaf6" stroke="rgba(0,0,0,.1)" stroke-width="1"/>`}
      ${door.image
        ? `<clipPath id="slab-${uid}"><rect x="0" y="0" width="${DW}" height="${DH}" rx="3"/></clipPath>
      <image href="${door.image}" x="0" y="0" width="${DW}" height="${DH}" preserveAspectRatio="xMidYMid slice" clip-path="url(#slab-${uid})" style="filter:${fin.filter || 'none'}"/>`
        : `<rect x="0" y="0" width="${DW}" height="${DH}" rx="3" fill="url(#face-${uid})"/>${grain}`}
      <rect x="0" y="0" width="${DW}" height="${DH}" rx="3" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1.5"/>
      ${door.image ? '' : doorGlass}
      ${door.image ? '' : (doorGlass ? '' : grooves)}
      <rect x="${DW-20}" y="${DH/2-30}" width="6" height="60" rx="3" fill="${handleColor}"/>
      <rect x="${DW-19}" y="${DH/2-29}" width="2.5" height="58" rx="2" fill="rgba(255,255,255,.3)"/>
    </g>
    ${opts.bare ? '' : `<ellipse cx="${totalW/2}" cy="${totalH+14}" rx="${totalW/2+8}" ry="9" fill="url(#floor-${uid})"/>`}
  </svg>`;
}

window.PANES = {
  DOORS, FINISHES, CONFIG,
  doorSceneHTML, patternSVG, unitSVG,
  defaultSel, computePrice, specsFor,
};
