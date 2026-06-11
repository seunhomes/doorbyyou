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

  /* ---- doorbyyou exterior colour palette (20 finishes for entry doors) ---- */
  'snow-white':      { label: 'Snow White',      swatch: '#ECEAE1', palette: true },
  'dover-gray':      { label: 'Dover Gray',      swatch: '#9B9B93', palette: true },
  'rockwell-blue':   { label: 'Rockwell Blue',   swatch: '#98A7AC', palette: true },
  'almond':          { label: 'Almond',          swatch: '#E7DCC2', palette: true },
  'chesapeake-gray': { label: 'Chesapeake Gray', swatch: '#8A979C', palette: true },
  'midnight-surf':   { label: 'Midnight Surf',   swatch: '#3C4F54', palette: true },
  'monterey-sand':   { label: 'Monterey Sand',   swatch: '#C8B48F', palette: true },
  'storm':           { label: 'Storm',           swatch: '#6C787C', palette: true },
  'marine-dusk':     { label: 'Marine Dusk',     swatch: '#3D4857', palette: true },
  'pebble':          { label: 'Pebble',          swatch: '#A89A86', palette: true },
  'hudson-slate':    { label: 'Hudson Slate',    swatch: '#6B7B85', palette: true },
  'meadow-fern':     { label: 'Meadow Fern',     swatch: '#6E7B5D', palette: true },
  'dark-drift':      { label: 'Dark Drift',      swatch: '#7D766A', palette: true },
  'windswept-smoke': { label: 'Windswept Smoke', swatch: '#8C8D88', palette: true },
  'moonlit-moss':    { label: 'Moonlit Moss',    swatch: '#7B8073', palette: true },
  'rockport-brown':  { label: 'Rockport Brown',  swatch: '#7A6350', palette: true },
  'iron-ore':        { label: 'Iron Ore',        swatch: '#474746', palette: true },
  'majestic-brick':  { label: 'Majestic Brick',  swatch: '#7B3F39', palette: true },
  'smoked-timber':   { label: 'Smoked Timber',   swatch: '#4E443B', palette: true },
  'coastal-blue':    { label: 'Coastal Blue',    swatch: '#345468', palette: true },

  /* ---- stain colours for wood-species slabs (oak/mahogany/teak) — PLACEHOLDER tones, swap for the real stain chart ---- */
  'natural':      { label: 'Natural',     swatch: '#CBA876', stain: true },
  'golden-oak':   { label: 'Golden Oak',  swatch: '#BE8A45', stain: true },
  'cedar':        { label: 'Cedar',       swatch: '#A35E33', stain: true },
  'chestnut':     { label: 'Chestnut',    swatch: '#8B5A2B', stain: true },
  'walnut-stain': { label: 'Walnut',      swatch: '#6B4423', stain: true },
  'dark-walnut':  { label: 'Dark Walnut', swatch: '#4A2F1B', stain: true },
  'mahogany':     { label: 'Mahogany',    swatch: '#6E3B2A', stain: true },
  'espresso':     { label: 'Espresso',    swatch: '#3A2A1E', stain: true },
};

/* Tint a (grayscale) oak render toward a finish swatch. Returns the swatch
   colour plus a brightness level derived from its luminance, so flat areas of
   the door land on the true swatch colour while grooves keep their shading. */
function finishTint(key) {
  const f = FINISHES[key];
  if (!f || !f.swatch) return null;
  const n = parseInt(f.swatch.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;   // 0..1
  const lvl = Math.max(0.25, Math.min(2.2, lum / 0.55));   // 0.55 ≈ oak render mean
  return { color: f.swatch, lvl: lvl.toFixed(3) };
}

/* ---- The catalog: doorbyyou woodgrain entry-door designs (oak finish renders) ---- */
const DOORS = [
  { name: 'Chevron',       material: 'Fiberglass', style: 'Contemporary', price: 2454, pattern: 'chevron',     finish: 'golden-oak', image: 'images/doors/chevron.jpg',       desc: 'Bold mirrored chevron grooves across a warm oak woodgrain slab.' },
  { name: 'Chevron Boxed', material: 'Fiberglass', style: 'Contemporary', price: 2505, pattern: 'chevron',     finish: 'golden-oak', image: 'images/doors/chevron-boxed.jpg', desc: 'Chevron pattern framed within a clean boxed border for added structure.' },
  { name: 'Herringbone',   material: 'Fiberglass', style: 'Traditional',  price: 2913, pattern: 'herringbone', finish: 'golden-oak', image: 'images/doors/herringbone.jpg',   desc: 'Classic herringbone groovework in a rich oak woodgrain.' },
  { name: 'Parquet',       material: 'Fiberglass', style: 'Traditional',  price: 2999, pattern: 'herringbone', finish: 'golden-oak', image: 'images/doors/parquet.jpg',       desc: 'Interlocking parquet blocks for a tailored, heritage look.' },
  { name: 'Envelope',      material: 'Fiberglass', style: 'Modern',       price: 2607, pattern: 'abstract',    finish: 'golden-oak', image: 'images/doors/envelope.jpg',      desc: 'Crossed diagonals fold the slab into a striking envelope motif.' },
  { name: 'Arrow',         material: 'Fiberglass', style: 'Modern',       price: 2454, pattern: 'chevron',     finish: 'golden-oak', image: 'images/doors/arrow.jpg',         desc: 'Directional arrow grooves give this oak door confident movement.' },
  { name: 'Two Way',       material: 'Fiberglass', style: 'Contemporary', price: 2556, pattern: 'chevron',     finish: 'golden-oak', image: 'images/doors/two-way.jpg',       desc: 'Opposing groove fields meet at a crisp two-way centre line.' },
  { name: 'Mosaic',        material: 'Fiberglass', style: 'Contemporary', price: 3100, pattern: 'grid',        finish: 'golden-oak', image: 'images/doors/mosaic.jpg',        desc: 'A composed grid of grooved tiles for a refined mosaic face.' },
  { name: 'Address',       material: 'Fiberglass', style: 'Traditional',  price: 3600, pattern: 'hVaried',     finish: 'golden-oak', image: 'images/doors/address.jpg',       desc: 'Personalised house-number engraving above a stepped groove field.' },
  { name: 'Craft',         material: 'Fiberglass', style: 'Traditional',  price: 2862, pattern: 'sixPanel',    finish: 'golden-oak', image: 'images/doors/craft.jpg',         desc: 'Craftsman-inspired panelled composition in warm oak.' },
  { name: 'Duo',           material: 'Fiberglass', style: 'Modern',       price: 2301, pattern: 'twoPanel',    finish: 'golden-oak', image: 'images/doors/duo.jpg',           desc: 'Two clean panels split the slab for a balanced modern look.' },
  { name: 'Plank',         material: 'Fiberglass', style: 'Modern',       price: 2250, pattern: 'plank',       finish: 'golden-oak', image: 'images/doors/plank.jpg',         desc: 'Vertical plank grooves for a clean, contemporary entrance.' },
  { name: 'Busy Plank',    material: 'Fiberglass', style: 'Contemporary', price: 2403, pattern: 'plank',       finish: 'golden-oak', image: 'images/doors/busy-plank.jpg',    desc: 'Densely spaced plank grooves add rhythm and fine detail.' },
  { name: 'Full Step',     material: 'Fiberglass', style: 'Contemporary', price: 2403, pattern: 'hChannel',    finish: 'golden-oak', image: 'images/doors/full-step.jpg',     desc: 'Full-width stepped channels march down the oak slab.' },
  { name: 'Half Step',     material: 'Fiberglass', style: 'Contemporary', price: 2352, pattern: 'hVaried',     finish: 'golden-oak', image: 'images/doors/half-step.jpg',     desc: 'Offset half-step grooves for a quietly dynamic surface.' },
  { name: 'Odd',           material: 'Fiberglass', style: 'Modern',       price: 2352, pattern: 'abstract',    finish: 'golden-oak', image: 'images/doors/odd.jpg',           desc: 'An off-beat asymmetric groove layout for a design-forward entry.' },
  { name: 'Mild',          material: 'Fiberglass', style: 'Modern',       price: 2199, pattern: 'hLines',      finish: 'golden-oak', image: 'images/doors/mild.jpg',          desc: 'Understated horizontal lines for a soft, minimal statement.' },
  { name: 'Even',          material: 'Fiberglass', style: 'Modern',       price: 2199, pattern: 'hLines',      finish: 'golden-oak', image: 'images/doors/even.jpg',          desc: 'Evenly spaced horizontal grooves — calm, linear and modern.' },
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
    const t = finishTint(d.finish);
    if (!t) return `<img class="door-svg door-photo" src="${d.image}" alt="${d.name} entry door" loading="lazy" />`;
    return `<span class="door-svg door-tint" style="--tint:${t.color};--lvl:${t.lvl}"><img src="${d.image}" alt="${d.name} entry door" loading="lazy" /></span>`;
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
  /* Door + frame configuration. Base price = frame + stain, indexed
     [standard height, 8ft height]. Figures from the 2026 price sheets. */
  configurations: [
    { label: 'Single',               sides: 0, dbl: false, frame: [1550, 2000], stain: [1000, 1250] },
    { label: 'Single + 1 sidelite',  sides: 1, dbl: false, frame: [1900, 2350], stain: [1300, 1450] },
    { label: 'Single + 2 sidelites', sides: 2, dbl: false, frame: [2300, 2800], stain: [1800, 2200] },
    { label: 'Double door',          sides: 0, dbl: true,  frame: [2900, 3750], stain: [2700, 2950] },
    { label: 'Double + 2 sidelites', sides: 2, dbl: true,  frame: [3500, 4300], stain: [3200, 3500] },
  ],
  heights: [
    { label: `Standard · up to 7'` },
    { label: `8 ft tall` },
  ],
  // oversize adders (over the standard width/height)
  sizes: [
    { label: 'Standard size', add: 0 },
    { label: `42" × 79"`,  add: 250 },
    { label: `42" × 95"`,  add: 300 },
    { label: `48" × 95"`,  add: 425 },
    { label: `48" × 108"`, add: 1000 },
  ],
  finishKeys: ['natural', 'golden-oak', 'cedar', 'chestnut', 'walnut-stain', 'dark-walnut', 'mahogany', 'espresso'],
  // Direct-glaze glass; price is the 0–5 sq ft rate (typical lite). Larger glazing is quoted by sq ft.
  glass: [
    { label: 'None (solid)',          tint: null,      price: 0 },
    { label: 'Clear',                 tint: 'clear',   price: 300 },
    { label: 'Acid etch',             tint: 'etch',    price: 400 },
    { label: 'Black tint',            tint: 'tint',    price: 450 },
    { label: 'Black tint · privacy',  tint: 'privacy', price: 450 },
    { label: 'Clear border',          tint: 'border',  price: 450 },
    { label: 'Prairie decorative',    tint: 'prairie', price: 740 },
  ],
  transoms: [
    { label: 'None',        add: 0,   h: 0 },
    { label: 'Rectangular', add: 500, h: 14 },
    { label: 'Arched',      add: 500, h: 18, arch: true },
  ],
  hinges: [
    { label: 'Satin Nickel', add: 0,   swatch: '#b9bcc0' },
    { label: 'Black',        add: 0,   swatch: '#222224' },
    { label: 'Concealed',    add: 250, swatch: '#6f7175' },
  ],
  // handle & lock styles (included; not separately priced in the sheets)
  handles: [
    { label: 'Tubular Pull · 48"',   add: 0, sku: 'H-TP48' },
    { label: 'Square Lever Set',     add: 0, sku: 'H-SQL' },
    { label: 'Modern Bar · 60"',     add: 0, sku: 'H-MB60' },
    { label: 'Entry Set + Deadbolt', add: 0, sku: 'H-ESD' },
  ],
  handleSides: [
    { label: 'Right hand', side: 'right' },
    { label: 'Left hand',  side: 'left' },
  ],
  jambs: [
    { label: `4-9/16"`, add: 0 },
    { label: `6-9/16"`, add: 0 },
    { label: `7-9/16"`, add: 0 },
  ],
  brickmould: [
    { label: 'No brick mould', add: 0, on: false },
    { label: `Brick mould · 2"×1"`, add: 0, on: true },
  ],
  paintedGrooves: [
    { label: 'Natural', add: 0, painted: false },
    { label: 'Painted black', add: 0, painted: true },
  ],
  // freight estimate: region base + per-configuration surcharge (heavier units cost more)
  shipping: {
    regions: [
      { key: 'ca', label: 'Canada', base: 179 },
      { key: 'us', label: 'United States', base: 289 },
    ],
    configAdd: [0, 50, 80, 110, 150],   // by configuration index (single … double+2SL)
  },
  samplePrice: 15,   // per stain-colour sample chip (credited on a door order)
};

/* Default selection object for a door */
function defaultSel(door) {
  let fin = CONFIG.finishKeys.indexOf(door.finish); if (fin < 0) fin = 0;
  return { config: 0, height: 0, size: 0, finish: fin, frame: fin, glass: 0, transom: 0,
    handle: 0, handleSide: 0, hinge: 0, jamb: 0, brickmould: 0, grooves: 0, region: 0 };
}

/* Freight estimate for a selection + destination region */
function shippingFor(sel) {
  const r = CONFIG.shipping.regions[sel.region] || CONFIG.shipping.regions[0];
  return r.base + (CONFIG.shipping.configAdd[sel.config] || 0);
}

/* Total configured price for a door + selection */
function computePrice(door, s) {
  const c = CONFIG.configurations[s.config] || CONFIG.configurations[0];
  const h = s.height ? 1 : 0;
  let total = c.frame[h] + c.stain[h];
  total += (CONFIG.sizes[s.size] || { add: 0 }).add;
  total += (CONFIG.glass[s.glass] || { price: 0 }).price;
  total += (CONFIG.transoms[s.transom] || { add: 0 }).add;
  total += (CONFIG.handles[s.handle] || { add: 0 }).add;
  total += (CONFIG.hinges[s.hinge] || { add: 0 }).add;
  total += (CONFIG.jambs[s.jamb] || { add: 0 }).add;
  total += (CONFIG.brickmould[s.brickmould] || { add: 0 }).add;
  total += (CONFIG.paintedGrooves[s.grooves] || { add: 0 }).add;
  return total;
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
    <linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e6eef0"/><stop offset=".34" stop-color="#c3d0d3"/>
      <stop offset=".5" stop-color="#aebfc4"/><stop offset=".78" stop-color="#bcc9cc"/><stop offset="1" stop-color="#d3dbdc"/>
    </linearGradient>
    <linearGradient id="gldk-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#454f52"/><stop offset=".42" stop-color="#272d2f"/>
      <stop offset=".6" stop-color="#1f2426"/><stop offset="1" stop-color="#343d3f"/>
    </linearGradient>`;
}
function glassFill(tint, uid) {
  if (!tint) return null;
  const dark = tint === 'tint' || tint === 'privacy' || tint === 'iron';
  return `url(#${dark ? 'gldk' : 'gl'}-${uid})`;
}
/* Realistic-ish glazing: sky-reflection gradient + diagonal sheen, with
   frosted/reeded texture for etched glass and a dark gradient for tints. */
const GLASS_IMG = { clear: 'clear', etch: 'etch', tint: 'tint', privacy: 'etch', border: 'clear', prairie: 'prairie' };
function glassPanel(x, y, w, h, tint, uid, mullions) {
  if (!tint) return '';
  // real photographic glass texture (clipped into the opening) when available
  const gimg = GLASS_IMG[tint];
  if (gimg) {
    const cid = 'gp' + uid + 'a' + Math.round(x) + '_' + Math.round(y);
    let r = `<clipPath id="${cid}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/></clipPath>`
      + `<image href="images/glass/${gimg}.jpg" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${cid})"/>`;
    if (tint === 'border') r += `<rect x="${x + 7}" y="${y + 7}" width="${w - 14}" height="${h - 14}" fill="none" stroke="rgba(244,247,247,.85)" stroke-width="${Math.max(8, Math.min(16, w * 0.16))}"/>`;
    r += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="rgba(0,0,0,.3)" stroke-width="2"/>`;
    return r;
  }
  const dark  = tint === 'tint' || tint === 'privacy' || tint === 'iron';
  const frost = tint === 'etch' || tint === 'frost' || tint === 'privacy';
  let s = '';
  // base glass
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${dark ? 'gldk' : 'gl'}-${uid})"/>`;
  // diagonal specular sheen (skip on heavy frost so it stays soft)
  if (!frost) {
    s += `<polygon points="${x},${y+h*0.6} ${x+w*0.52},${y} ${x+w*0.76},${y} ${x},${y+h*0.9}" fill="rgba(255,255,255,${dark ? 0.13 : 0.24})"/>`;
    s += `<polygon points="${x+w*0.72},${y} ${x+w*0.9},${y} ${x},${y+h} ${x},${y+h*0.94}" fill="rgba(255,255,255,${dark ? 0.05 : 0.1})"/>`;
  }
  // frosted / acid-etch: translucent obscuring layer + fine reeded streaks
  if (frost) {
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${dark ? 'rgba(64,73,76,.6)' : 'rgba(244,247,247,.82)'}"/>`;
    for (let xx = x + 7; xx < x + w - 4; xx += 9) s += `<line x1="${xx}" y1="${y+3}" x2="${xx}" y2="${y+h-3}" stroke="rgba(255,255,255,.16)" stroke-width="2"/>`;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h*0.4}" fill="rgba(255,255,255,${dark ? 0.06 : 0.16})"/>`;
  }
  // clear-border: etched frame band around a clear centre
  if (tint === 'border') {
    const b = Math.max(8, Math.min(16, w * 0.16));
    s += `<rect x="${x + b/2}" y="${y + b/2}" width="${w - b}" height="${h - b}" fill="none" stroke="rgba(244,247,247,.85)" stroke-width="${b}"/>`;
  }
  // raised muntin / grille bars
  if (mullions) {
    const n = Math.max(2, Math.round(h / 150));
    for (let i = 1; i <= n; i++) {
      const yy = y + h * i / (n + 1);
      s += `<rect x="${x}" y="${yy-2}" width="${w}" height="4" fill="rgba(255,255,255,.42)"/>`;
      s += `<rect x="${x}" y="${yy+2}" width="${w}" height="1.2" fill="rgba(0,0,0,.22)"/>`;
    }
  }
  // glazing bead (inner highlight) + outer edge
  s += `<rect x="${x+1.5}" y="${y+1.5}" width="${w-3}" height="${h-3}" fill="none" stroke="rgba(255,255,255,.32)" stroke-width="1"/>`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="rgba(0,0,0,.3)" stroke-width="2"/>`;
  return s;
}

/* ============================================================
   Full unit renderer — door + optional sidelites + transom.
   Used by the detail page and standalone configurator.
   ============================================================ */
function unitSVG(door, sel, opts) {
  opts = opts || {};
  const f = FINISHES[door.finish] || FINISHES.black;
  const finKey = sel && sel.finish != null ? CONFIG.finishKeys[sel.finish] : door.finish;
  const fin = FINISHES[finKey] || f;
  const uid = 'u' + (_sceneSeq++);
  const st = fin.stops || ['#cfcabd', '#bdb7a8', '#a79f8e', '#8f8674'];
  const tint = finishTint(finKey);
  const cfg = CONFIG.configurations[sel ? sel.config : 0] || CONFIG.configurations[0];
  const tr = CONFIG.transoms[sel ? sel.transom : 0] || CONFIG.transoms[0];
  const gl = CONFIG.glass[sel ? sel.glass : 0] || CONFIG.glass[0];
  const hinge = CONFIG.hinges[sel ? sel.hinge : 0] || CONFIG.hinges[0];
  const handleColor = hinge.swatch;
  const frameKey = sel && sel.frame != null ? CONFIG.finishKeys[sel.frame] : finKey;
  const frameColor = (FINISHES[frameKey] || {}).swatch || '#fbfaf6';
  const groovesPainted = !!(CONFIG.paintedGrooves[sel ? sel.grooves : 0] || {}).painted;
  const brick = !!(CONFIG.brickmould[sel ? sel.brickmould : 0] || {}).on;
  const handLeft = (CONFIG.handleSides[sel ? sel.handleSide : 0] || {}).side === 'left';

  const dbl = !!cfg.dbl;
  const DWd = dbl ? 320 : DW;          // door footprint width
  const leftS = cfg.sides >= 1, rightS = cfg.sides >= 2;
  const hasSL = leftS || rightS;
  const FR = 13;                       // uniform jamb / mullion thickness
  const SG = 54;                       // sidelite glass width
  const leftPad  = leftS  ? FR + SG + FR : (hasSL ? FR : 0);
  const rightPad = rightS ? FR + SG + FR : (hasSL ? FR : 0);
  const doorX = leftPad;
  const totalW = leftPad + DWd + rightPad;
  const trH = tr.h ? 70 : 0;
  const topY = trH ? trH + 12 : 0;
  const slabY = topY + (hasSL ? FR : 0);
  const totalH = slabY + DH;

  const faceGrad = `<linearGradient id="face-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${st[0]}"/><stop offset=".42" stop-color="${st[1]}"/>
      <stop offset=".72" stop-color="${st[2]}"/><stop offset="1" stop-color="${st[3]}"/></linearGradient>`;

  // one door leaf: shadow + slab (tinted render or gradient) + edge + handle
  function leaf(x, w, handleX) {
    const cid = 'c' + uid + 'x' + Math.round(x);
    const face = door.image
      ? `<clipPath id="${cid}"><rect x="${x}" y="0" width="${w}" height="${DH}" rx="3"/></clipPath>
        <g clip-path="url(#${cid})" style="isolation:isolate">
          <rect x="${x}" y="0" width="${w}" height="${DH}" fill="${tint ? tint.color : '#bdb7a8'}"/>
          <image href="${door.image}" x="${x}" y="0" width="${w}" height="${DH}" preserveAspectRatio="xMidYMid slice" style="filter:grayscale(1) brightness(${tint ? tint.lvl : 1}) contrast(1.04);mix-blend-mode:luminosity"/>
          ${groovesPainted ? `<image href="${door.image}" x="${x}" y="0" width="${w}" height="${DH}" preserveAspectRatio="xMidYMid slice" filter="url(#grv-${uid})"/>` : ''}
        </g>`
      : `<rect x="${x}" y="0" width="${w}" height="${DH}" rx="3" fill="url(#face-${uid})"/>`;
    return `
      <rect x="${x + 6}" y="8" width="${w}" height="${DH}" rx="3" fill="rgba(0,0,0,.16)"/>
      ${face}
      <rect x="${x}" y="0" width="${w}" height="${DH}" rx="3" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1.5"/>
      <rect x="${handleX}" y="${DH/2-30}" width="6" height="60" rx="3" fill="${handleColor}"/>
      <rect x="${handleX+1}" y="${DH/2-29}" width="2.5" height="58" rx="2" fill="rgba(255,255,255,.3)"/>`;
  }

  let leaves;
  if (dbl) {
    const MULL = 6, LW = (DWd - MULL) / 2;
    leaves = leaf(0, LW, LW - 18) + leaf(LW + MULL, LW, LW + MULL + 12);
  } else {
    leaves = leaf(0, DWd, handLeft ? 14 : DWd - 20);
  }

  let frames = '';
  // transom
  if (tr.h) {
    if (tr.arch) {
      frames += `<path d="M0 ${trH} L0 26 Q${totalW/2} ${-18} ${totalW} 26 L${totalW} ${trH} Z" fill="${frameColor}" stroke="rgba(0,0,0,.14)" stroke-width="2"/>`;
      frames += `<path d="M10 ${trH-6} L10 30 Q${totalW/2} ${-6} ${totalW-10} 30 L${totalW-10} ${trH-6} Z" fill="${glassFill(gl.tint || 'clear', uid)}"/>`;
      frames += `<path d="M10 ${trH-6} L10 30 Q${totalW/2} ${-6} ${totalW-10} 30 L${totalW-10} ${trH-6} Z" fill="rgba(255,255,255,.14)"/>`;
    } else {
      frames += `<rect x="0" y="0" width="${totalW}" height="${trH}" rx="2" fill="${frameColor}" stroke="rgba(0,0,0,.14)" stroke-width="2"/>`;
      frames += glassPanel(8, 8, totalW - 16, trH - 16, gl.tint || 'clear', uid, false);
    }
  }
  // unified jamb behind the door + sidelites, so every mullion is equal width
  if (hasSL) {
    frames += `<rect x="0" y="${topY}" width="${totalW}" height="${DH + FR}" rx="4" fill="${frameColor}" stroke="rgba(0,0,0,.14)" stroke-width="2"/>`;
  }
  if (leftS)  frames += glassPanel(FR, slabY, SG, DH, gl.tint || 'etch', uid, true);
  if (rightS) frames += glassPanel(totalW - FR - SG, slabY, SG, DH, gl.tint || 'etch', uid, true);

  return `
  <svg class="door-svg unit" viewBox="-20 ${trH ? -24 : -14} ${totalW + 40} ${totalH + 34}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs>${faceGrad}${glassDefs(uid)}
      ${groovesPainted ? `<filter id="grv-${uid}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.3 -0.59 -0.11 0 1"/><feComponentTransfer><feFuncA type="gamma" amplitude="4" exponent="5" offset="0"/></feComponentTransfer></filter>` : ''}
      <linearGradient id="floor-${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="rgba(0,0,0,.12)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></linearGradient>
    </defs>
    ${brick ? `<rect x="-14" y="-8" width="${totalW+28}" height="${totalH+16}" rx="3" fill="${frameColor}" stroke="rgba(0,0,0,.22)" stroke-width="2"/>` : ''}
    ${frames}
    <g transform="translate(${doorX}, ${slabY})">
      ${(opts.bare || hasSL) ? '' : `<rect x="-12" y="-6" width="${DWd+24}" height="${DH+10}" rx="2" fill="${frameColor}" stroke="rgba(0,0,0,.1)" stroke-width="1"/>`}
      ${leaves}
    </g>
    ${opts.bare ? '' : `<ellipse cx="${totalW/2}" cy="${totalH+14}" rx="${totalW/2+8}" ry="9" fill="url(#floor-${uid})"/>`}
  </svg>`;
}

window.PANES = {
  DOORS, FINISHES, CONFIG,
  doorSceneHTML, patternSVG, unitSVG,
  defaultSel, computePrice, shippingFor, specsFor,
};
