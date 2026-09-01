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
  'mahogany':     { label: 'Mahogany',    swatch: '#6B2B24', stain: true },
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
  { name: 'Chevron Boxed', material: 'Fiberglass', style: 'Contemporary', price: 2505, pattern: 'chevronBoxed',     finish: 'golden-oak', image: 'images/doors/chevron-boxed.jpg', desc: 'Chevron pattern framed within a clean boxed border for added structure.' },
  { name: 'Herringbone',   material: 'Fiberglass', style: 'Traditional',  price: 2913, pattern: 'herringboneNest', finish: 'golden-oak', image: 'images/doors/herringbone.jpg',   desc: 'Classic herringbone groovework in a rich oak woodgrain.' },
  { name: 'Parquet',       material: 'Fiberglass', style: 'Traditional',  price: 2999, pattern: 'parquet45', finish: 'golden-oak', image: 'images/doors/parquet.jpg',       desc: 'Interlocking parquet blocks for a tailored, heritage look.' },
  { name: 'Envelope',      material: 'Fiberglass', style: 'Modern',       price: 2607, pattern: 'envelopeT',    finish: 'golden-oak', image: 'images/doors/envelope.jpg',      desc: 'Crossed diagonals fold the slab into a striking envelope motif.' },
  { name: 'Arrow',         material: 'Fiberglass', style: 'Modern',       price: 2454, pattern: 'arrowT',     finish: 'golden-oak', image: 'images/doors/arrow.jpg',         desc: 'Directional arrow grooves give this oak door confident movement.' },
  { name: 'Two Way',       material: 'Fiberglass', style: 'Contemporary', price: 2556, pattern: 'twoWayT',     finish: 'golden-oak', image: 'images/doors/two-way.jpg',       desc: 'Opposing groove fields meet at a crisp two-way centre line.' },
  { name: 'Mosaic',        material: 'Fiberglass', style: 'Contemporary', price: 3100, pattern: 'mosaicT',        finish: 'golden-oak', image: 'images/doors/mosaic.jpg',        desc: 'A composed grid of grooved tiles for a refined mosaic face.' },
  { name: 'Address',       material: 'Fiberglass', style: 'Traditional',  price: 3600, pattern: 'addressT',     finish: 'golden-oak', image: 'images/doors/address.jpg',       desc: 'Personalised house-number engraving above a stepped groove field.' },
  { name: 'Craft',         material: 'Fiberglass', style: 'Traditional',  price: 2862, pattern: 'craftLines',    finish: 'golden-oak', image: 'images/doors/craft.jpg',         desc: 'Craftsman-inspired panelled composition in warm oak.' },
  { name: 'Duo',           material: 'Fiberglass', style: 'Modern',       price: 2301, pattern: 'duoT',    finish: 'golden-oak', image: 'images/doors/duo.jpg',           desc: 'Two clean panels split the slab for a balanced modern look.' },
  { name: 'Plank',         material: 'Fiberglass', style: 'Modern',       price: 2250, pattern: 'plankT',       finish: 'golden-oak', image: 'images/doors/plank.jpg',         desc: 'Vertical plank grooves for a clean, contemporary entrance.' },
  { name: 'Busy Plank',    material: 'Fiberglass', style: 'Contemporary', price: 2403, pattern: 'busyPlank',       finish: 'golden-oak', image: 'images/doors/busy-plank.jpg',    desc: 'Densely spaced plank grooves add rhythm and fine detail.' },
  { name: 'Full Step',     material: 'Fiberglass', style: 'Contemporary', price: 2403, pattern: 'fullStep',    finish: 'golden-oak', image: 'images/doors/full-step.jpg',     desc: 'Full-width stepped channels march down the oak slab.' },
  { name: 'Half Step',     material: 'Fiberglass', style: 'Contemporary', price: 2352, pattern: 'halfStep',     finish: 'golden-oak', image: 'images/doors/half-step.jpg',     desc: 'Offset half-step grooves for a quietly dynamic surface.' },
  { name: 'Odd',           material: 'Fiberglass', style: 'Modern',       price: 2352, pattern: 'oddT',    finish: 'golden-oak', image: 'images/doors/odd.jpg',           desc: 'An off-beat asymmetric groove layout for a design-forward entry.' },
  { name: 'Mild',          material: 'Fiberglass', style: 'Modern',       price: 2199, pattern: 'mildT',      finish: 'golden-oak', image: 'images/doors/mild.jpg',          desc: 'Understated horizontal lines for a soft, minimal statement.' },
  { name: 'Even',          material: 'Fiberglass', style: 'Modern',       price: 2199, pattern: 'evenT',      finish: 'golden-oak', image: 'images/doors/even.jpg',          desc: 'Evenly spaced horizontal grooves — calm, linear and modern.' },
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

const PHOTO_TRACES = {"chevron":[[100,2,100,467],[97,65,2,125],[97,332,2,392],[97,225,2,286],[198,125,103,65],[198,392,103,332],[198,232,103,172],[97,172,1,232],[198,445,97,385],[97,118,2,179],[198,286,103,225],[198,339,103,279],[97,278,2,339],[97,386,1,446],[198,72,103,12],[97,12,2,72],[198,179,103,119],[146,467,103,439],[97,439,53,467]],"chevronBoxed":[[41,42,43,429],[98,42,102,429],[156,42,158,429],[155,42,44,43],[155,428,44,429],[97,98,44,132],[97,152,44,186],[97,260,44,295],[96,45,44,78],[155,186,103,152],[97,314,44,349],[97,206,44,240],[155,403,103,368],[155,240,103,206],[97,368,44,402],[155,132,103,98],[155,294,103,260],[155,78,103,45],[155,348,103,315]],"herringboneNest":[[197,235,2,30],[196,235,2,439],[177,216,2,399],[197,155,52,3],[158,233,2,70],[196,194,14,3],[197,315,53,467],[196,276,14,467],[138,216,2,359],[197,115,91,3],[197,355,91,467],[119,233,2,110],[101,216,2,319],[81,233,2,150],[197,75,129,3],[197,395,129,467],[62,216,2,279],[43,233,2,190],[197,435,167,467],[197,35,166,3]],"parquet45":[[198,186,81,62],[198,226,81,102],[198,426,81,302],[198,466,81,342],[198,386,81,262],[198,266,81,142],[198,346,81,222],[198,146,81,22],[198,306,82,181],[198,106,100,2],[98,285,2,386],[98,204,1,306],[97,365,1,466],[98,245,2,346],[98,325,1,426],[98,45,2,146],[97,165,2,266],[99,4,2,106],[98,125,2,226],[160,467,82,385],[98,85,2,186],[98,405,39,467],[198,66,141,5],[122,467,82,425],[59,4,2,66],[198,25,178,6],[98,445,77,467]],"envelopeT":[[32,38,32,199],[32,270,34,467],[198,467,3,232],[65,77,65,160],[67,316,67,467],[198,3,4,232],[98,117,2,3],[100,355,100,467],[132,393,133,467],[165,432,165,467]],"arrowT":[[197,30,3,236],[197,439,4,236],[197,70,41,235],[198,400,42,235],[197,110,79,236],[39,277,2,316],[197,359,80,236],[38,193,2,154],[115,356,10,467],[115,113,10,3],[197,150,117,236],[58,297,2,356],[96,336,2,436],[96,133,2,34],[198,319,119,236],[58,172,2,114],[197,190,149,242],[77,317,2,395],[135,93,48,3],[134,376,48,467],[154,396,87,467],[197,279,157,237],[77,153,2,74],[154,73,86,3],[173,416,124,467],[173,53,125,3],[193,33,162,3],[192,436,163,467]],"twoWayT":[[198,467,2,3],[175,467,1,56],[153,467,2,109],[130,467,2,163],[107,467,1,216],[85,467,2,269],[198,26,14,26],[198,50,24,50],[198,73,34,74],[198,97,44,98],[62,467,1,323],[198,121,54,121],[198,145,64,145],[198,168,74,168],[198,192,84,192],[198,216,95,216],[198,239,104,239],[40,467,1,376],[198,263,115,264],[198,287,125,288],[198,311,134,310],[198,335,145,334],[198,358,155,359],[17,467,1,430],[198,382,165,382]],"mosaicT":[[66,3,69,73],[65,151,69,386],[145,72,149,282],[198,72,2,72],[134,315,133,468],[144,151,2,152],[130,385,2,386],[198,281,70,281],[198,316,70,316]],"addressT":[[191,459,2,459],[183,447,2,447],[175,435,2,435],[167,423,2,423],[160,411,2,411],[154,398,2,399],[144,387,2,387],[137,375,2,375],[130,362,2,363],[123,351,2,351],[116,339,2,339],[109,326,2,327],[102,314,2,315],[96,302,2,303],[90,290,2,291],[84,278,2,279],[78,266,2,266],[82,255,2,254],[67,242,2,242],[63,230,2,230],[58,218,2,218],[53,206,2,206],[49,194,2,194],[45,182,2,182],[42,170,2,170],[38,158,2,158],[34,146,2,146],[36,131,2,134],[28,122,2,122]],"craftLines":[[198,311,1,23],[166,3,1,395],[198,217,29,468],[198,42,2,114],[54,467,1,281]],"duoT":[[41,2,41,467],[49,3,50,467]],"fullStep":[[41,2,41,467],[158,3,158,467],[155,95,44,96],[155,188,44,189],[155,281,44,281],[155,373,44,374]],"halfStep":[[158,3,158,467],[155,95,2,96],[155,188,2,189],[155,281,2,281],[155,373,2,374]],"oddT":[[198,16,1,16],[198,31,1,31],[198,60,1,61],[198,70,1,70],[198,90,1,91],[198,106,1,106],[198,121,1,121],[198,151,1,151],[198,172,1,172],[198,181,1,181],[198,196,1,196],[198,211,1,211],[198,241,1,241],[198,256,1,256],[198,271,1,271],[198,292,1,292],[198,301,1,302],[198,331,1,331],[198,346,1,346],[198,361,1,361],[198,370,1,371],[198,391,1,392],[198,421,1,421],[198,430,1,430],[198,451,1,452]],"mildT":[[158,3,158,467],[198,384,1,384],[198,85,2,86],[155,44,1,44],[155,425,1,425]],"evenT":[[198,36,1,37],[198,72,1,73],[198,108,1,109],[198,144,1,145],[198,180,1,181],[198,216,1,217],[198,252,1,253],[198,288,1,289],[198,324,1,325],[198,360,1,361],[198,396,1,397],[198,432,1,433]]};

function patternSVG(pattern, g, hi) {
  /* measured traces: groove segments auto-extracted from the product photos
     (Hough line detection in slab space) - these win over the hand approximations */
  if (PHOTO_TRACES[pattern]) {
    let s = grooveLines(PHOTO_TRACES[pattern], g, 3);
    if (pattern === 'addressT') s += '<text x="104" y="48" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-weight="600" font-size="24" fill="' + g + '">123</text>'
      + '<text x="104" y="82" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-weight="600" font-size="21" fill="' + g + '">Main St.</text>';
    return s;
  }
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
    case 'chevron': {  // traced from the real slab: centre spine + 8 edge-to-edge Vs at ~24°
      let s = `<line x1="${DW/2}" y1="0" x2="${DW/2}" y2="${DH}" stroke="${g}" stroke-width="4"/>`;
      for (let y = 2; y < DH + 46; y += 59)
        s += `<path d="M0 ${y+46} L${DW/2} ${y} L${DW} ${y+46}" fill="none" stroke="${g}" stroke-width="4" stroke-linejoin="round"/>`;
      return s;
    }
    /* ---- patterns traced from the product photos, one per design ---- */
    case 'chevronBoxed': {  // border box + spine + chevrons inside
      const bx0 = 42, bx1 = 162, by0 = 44, by1 = 424, bcx = (bx0 + bx1) / 2;
      let s = `<rect x="${bx0}" y="${by0}" width="${bx1 - bx0}" height="${by1 - by0}" fill="none" stroke="${g}" stroke-width="4"/>`
        + grooveLines([[bcx, by0, bcx, by1]], g, 4);
      for (let y = by0; y + 44 <= by1; y += 54)
        s += `<path d="M${bx0} ${y + 44} L${bcx} ${y} L${bx1} ${y + 44}" fill="none" stroke="${g}" stroke-width="4" stroke-linejoin="round"/>`;
      return s;
    }
    case 'herringboneNest': {  // nested 45° down-pointing Vs + corner rays
      let s = '';
      for (let vy = 215; vy <= 455; vy += 30) {
        const tl = Math.min(90, vy), tr = Math.min(110, vy);
        s += `<path d="M${90 - tl} ${vy - tl} L90 ${vy} L${90 + tr} ${vy - tr}" fill="none" stroke="${g}" stroke-width="4" stroke-linejoin="round"/>`;
      }
      [55, 110, 165].forEach(k => { s += grooveLines([[k, 0, 0, k]], g, 4); });
      [45, 105, 165].forEach(k => { s += grooveLines([[DW - k, 0, DW, k]], g, 4); });
      return s;
    }
    case 'parquet45': {  // 45° chevron rows, apex left of centre, edge-to-edge
      let s = '';
      for (let y = -40; y < DH; y += 48) {
        const tl = Math.min(110, DH - y + 40), tr = Math.min(90, DH - y + 40);
        s += `<path d="M${110 - tl} ${y + tl} L110 ${y} L${110 + tr} ${y + tr}" fill="none" stroke="${g}" stroke-width="4" stroke-linejoin="round"/>`;
      }
      return s;
    }
    case 'envelopeT': return grooveLines([
      [200, 17, 3, 231], [3, 231, 200, 441],                              // envelope mains
      [0, 12, 100, 117], [100, 470, 163, 401],                            // corner + bottom flaps
      [63, 160, 63, 245], [85, 142, 85, 235],                             // upper-left field grooves
      [104, 339, 104, 470], [121, 357, 121, 470], [138, 375, 138, 470], [155, 393, 155, 470],
    ], g, 4);
    case 'arrowT': {  // steep nested '<' centred on the slab + parallel feathering, mirrored
      let s = '';
      const m = 235 / 106;   // arm slope traced from the photo (~65°)
      [66, 92, 118].forEach(vx => {
        const tx = vx + 106;
        const up = tx <= DW ? `${tx} 0` : `200 ${(235 - (200 - vx) * m).toFixed(1)}`;
        const dn = tx <= DW ? `${tx} ${DH}` : `200 ${(235 + (200 - vx) * m).toFixed(1)}`;
        s += `<path d="M${up} L${vx} 235 L${dn}" fill="none" stroke="${g}" stroke-width="4" stroke-linejoin="round"/>`;
      });
      [100, 170, 240, 310].forEach(e => {
        const tx = (e / m).toFixed(1);
        s += grooveLines([[0, e, +tx, 0]], g, 4) + grooveLines([[0, DH - e, +tx, DH]], g, 4);
      });
      return s;
    }
    case 'twoWayT': {  // steep divider, horizontals right, 45° diagonals left
      let s = grooveLines([[2, 0, 185, DH]], g, 4);
      const divX = (y) => 2 + 183 * y / DH;
      for (let y = 24; y < DH; y += 24) s += grooveLines([[divX(y) + 5, y, DW, y]], g, 4);
      for (let e = 30; e < DH + 170; e += 32) {
        const xi = (2 + 0.389 * e) / 1.389, yi = e - xi;
        const p = e <= DH ? [0, e] : [e - DH, DH];
        if (p[0] < xi) s += grooveLines([[p[0], p[1], xi, yi]], g, 4);
      }
      return s;
    }
    case 'mosaicT': return grooveLines([
      [69, 0, 69, 70], [0, 70, 200, 70], [150, 70, 150, 148], [0, 148, 150, 148],
      [69, 148, 69, 381], [69, 274, 200, 274], [69, 311, 200, 311],
      [0, 381, 137, 381], [137, 381, 137, 470],
    ], g, 4);
    case 'addressT': {  // engraved address + graduated line fan
      let s = `<text x="104" y="48" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-weight="600" font-size="24" fill="${g}">123</text>`
        + `<text x="104" y="82" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-weight="600" font-size="21" fill="${g}">Main St.</text>`;
      for (let i = 0; i < 32; i++) {
        const y = 32 + i * 13.4, len = 10 + Math.pow(i / 31, 1.15) * 190;
        s += grooveLines([[0, y, len, y]], g, 3);
      }
      return s;
    }
    case 'craftLines': return grooveLines([
      [0, 109, 167, 0], [21, 48, 200, 300], [175, 13, 25, 470],
      [200, 209, 83, 470], [0, 281, 96, 470], [0, 340, 55, 470], [200, 361, 125, 470],
    ], g, 4);
    case 'duoT': return grooveLines([[42, 0, 42, DH], [50, 0, 50, DH]], g, 4);
    case 'plankT': return grooveLines([25, 50, 75, 100, 125, 150, 175].map(x => [x, 0, x, DH]), g, 4);
    case 'busyPlank': { const a = []; for (let x = 6; x <= 150; x += 4.8) a.push([x, 0, x, DH]); return grooveLines(a, g, 2.5); }
    case 'fullStep': return grooveLines([
      [42, 0, 42, DH], [162, 0, 162, DH],
      [42, 94, 162, 94], [42, 187, 162, 187], [42, 281, 162, 281], [42, 374, 162, 374],
    ], g, 4);
    case 'halfStep': return grooveLines([
      [162, 0, 162, DH],
      [0, 94, 200, 94], [0, 187, 200, 187], [0, 281, 200, 281], [0, 374, 200, 374],
    ], g, 4);
    case 'oddT': return grooveLines(
      [13, 33, 60, 70, 94, 104, 120, 172, 182, 192, 202, 242, 253, 271, 288, 300, 330, 362, 376, 400, 422, 432, 444]
        .map(y => [0, y, DW, y]), g, 2.5);
    case 'mildT': return grooveLines([
      [160, 0, 160, 409], [0, 44, 146, 44], [0, 85, 200, 85], [160, 381, 200, 381], [0, 420, 144, 420],
    ], g, 4);
    case 'evenT': { const a = []; for (let y = 36; y <= 434; y += 36.2) a.push([0, y, DW, y]); return grooveLines(a, g, 4); }
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
  /* stains first (indices 0-7, stable for old share links), then the 20 paint
     colours the smooth skin uses — finishIdxFor() picks the right slice per grain */
  finishKeys: ['natural', 'golden-oak', 'cedar', 'chestnut', 'walnut-stain', 'dark-walnut', 'mahogany', 'espresso',
    'snow-white', 'dover-gray', 'rockwell-blue', 'almond', 'chesapeake-gray', 'midnight-surf', 'monterey-sand',
    'storm', 'marine-dusk', 'pebble', 'hudson-slate', 'meadow-fern', 'dark-drift', 'windswept-smoke',
    'moonlit-moss', 'rockport-brown', 'iron-ore', 'majestic-brick', 'smoked-timber', 'coastal-blue'],
  // Direct-glaze glass; price is the 0–5 sq ft rate (typical lite). Larger glazing is quoted by sq ft.
  glass: [
    { label: 'None (solid)',          tint: null,      price: 0 },
    { label: 'Clear',                 tint: 'clear',   price: 300 },
    { label: 'Acid etch',             tint: 'etch',    price: 400 },
    { label: 'Black tint',            tint: 'tint',    price: 450 },
    { label: 'Black tint · privacy',  tint: 'privacy', price: 450 },
    { label: 'Clear border',          tint: 'border',  price: 450 },
  ],
  transoms: [
    { label: 'None',        add: 0,   h: 0 },
    { label: 'Rectangular', add: 500, h: 14 },
    { label: 'Semi-circle', add: 500, h: 18, arch: true },
    { label: 'Segmental',   add: 500, h: 16, seg: true },
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
    { label: `4 5/8"`, add: 0, note: 'standard 2×4 wall' },
    { label: `6 5/8"`, add: 0, note: '2×6 wall' },
    { label: `7 5/8"`, add: 0, note: 'thicker insulated wall' },
  ],
  brickmould: [
    { label: 'None', add: 0, on: false },
    { label: `Installed · 2"×1"`, add: 0, on: true },
    { label: 'Shipped loose', add: 0, on: false, loose: true },
  ],
  /* ---- Guided-wizard options ---- */
  grains: [
    { label: 'Oak grain', key: 'oak', desc: 'Deep, pronounced oak texture — takes stain beautifully.' },
    { label: 'Mahogany grain', key: 'mahogany', desc: 'Fine, straight grain for rich, even stain tones.' },
    { label: 'Smooth', key: 'smooth', desc: 'Paint-grade smooth skin for solid painted colours.' },
  ],
  slabWidths: [
    { label: '32"', w: 32, add: 0 },
    { label: '34"', w: 34, add: 0 },
    { label: '36"', w: 36, add: 0, std: true },
    { label: '38"', w: 38, add: 150 },
    { label: '42"', w: 42, add: 250 },
    { label: '48"', w: 48, add: 425 },
  ],
  slabHeights: [
    { label: '79"', hIn: 79 },
    { label: '95"', hIn: 95 },
  ],
  // which side a single sidelite sits on, viewed from outside
  slSides: [
    { label: 'Left of the door' },
    { label: 'Right of the door' },
  ],
  frameFinishes: [
    { label: 'Smooth', key: 'smooth' },
    { label: 'Wood grain', key: 'grain' },
  ],
  thresholds: [
    { label: 'Mill (aluminum)', key: 'mill', swatch: '#b9bcc0' },
    { label: 'Black', key: 'black', swatch: '#222224' },
  ],
  swings: [
    { label: 'Inswing', key: 'in' },
    { label: 'Outswing', key: 'out' },
  ],
  // interior face of the slab
  interiors: [
    { label: 'White · standard', key: 'snow-white' },
    { label: 'Same as exterior', same: true },
    { label: 'Custom colour', custom: true },
  ],
  // sidelite / transom decorative glass styles (all safety tempered as standard)
  glassStyles: [
    { label: 'Clear',                        tint: 'clear',        add: 0 },
    { label: 'Sandblast',                    tint: 'etch',         add: 120 },
    { label: 'Sandblast · 1" clear border',  tint: 'frost-border', add: 160 },
    { label: 'Black',                        tint: 'tint',         add: 140 },
    { label: 'Black sandblast',              tint: 'privacy',      add: 170 },
    { label: 'Niagara',                      tint: 'niagara',      add: 190 },
    { label: 'Granite',                      tint: 'granite',      add: 190 },
    { label: 'Chinchilla',                   tint: 'chinchilla',   add: 190 },
    { label: 'Monumental',                   tint: 'monumental',   add: 190 },
    { label: 'Reeded',                       tint: 'reeded',       add: 190 },
  ],
  hardware: {
    types: [
      { label: 'Multipoint lock', key: 'mp', add: 0, desc: '3-point locking — hooks top & bottom plus centre latch. Choose pull bar, gripset or lever.' },
      { label: 'Pull bar + ball catch', key: 'ball', add: 0, desc: 'Fixed pull bar with a ball catch (non-multipoint). Pairs with a deadbolt.' },
      { label: 'Digital / smart lock', key: 'digital', add: 350, placeholder: true, desc: 'Keypad / smart entry. Model options coming soon — we’ll confirm on your quote.' },
      { label: 'No hardware', key: 'none', add: 0, desc: 'Prep only · double bore. Bring your own hardware.' },
    ],
    mpStyles: [
      { label: 'Pull bar', key: 'bar' },
      { label: 'Gripset', key: 'grip' },
      { label: 'Lever', key: 'lever' },
    ],
    barSizes: [
      { label: '48"' }, { label: '60"' }, { label: '72"' },
    ],
    // PLACEHOLDER pull-bar styles & colours — swap for the real hardware chart
    barColors: [
      { label: 'Matte Black', swatch: '#222224' },
      { label: 'Stainless', swatch: '#b9bcc0' },
      { label: 'Bronze', swatch: '#584a3a' },
    ],
    tLevers: [
      { label: 'Square' }, { label: 'Round' },
    ],
    dbShapes: [
      { label: 'Square' }, { label: 'Round' },
    ],
    dbColors: [
      { label: 'Black', swatch: '#222224' },
      { label: 'Silver', swatch: '#c3c6ca' },
    ],
  },
  paintedGrooves: [
    { label: 'Natural (no paint)', add: 0, painted: false },
    { label: 'Painted black', add: 0, painted: true },
  ],
  trim: {
    options: [
      { label: 'No interior trim', key: 'none', add: 0, desc: 'Jamb only — your installer or existing casing finishes the interior side.' },
      { label: 'Interior trim / casing', key: 'trim', add: 0, desc: 'Factory-matched casing installed around the interior of the opening.' },
    ],
    // trim finish adders are ESTIMATES — confirm against the price sheets
    finishes: [
      { label: 'Painted', add: 250, desc: 'Painted to match the interior colour.' },
      { label: 'Stained', add: 350, desc: 'Stained to match your slab stain tone.' },
    ],
    // PLACEHOLDER styles & sizes — swap for the real trim chart
    styles: [
      { label: 'Modern flat' }, { label: 'Colonial' }, { label: 'Craftsman' },
    ],
    sizes: [
      { label: '2-3/4"' }, { label: '3-1/2"' }, { label: '4-1/4"' },
    ],
  },
  // freight estimate: region base + per-configuration surcharge (heavier units cost more)
  shipping: {
    regions: [
      { key: 'ca', label: 'Canada', base: 179 },
      { key: 'us', label: 'United States', base: 289 },
    ],
    configAdd: [0, 50, 80, 110, 150],   // by configuration index (single … double+2SL)
  },
  samplePrice: 15,   // per stain-colour sample chip (credited on a door order)
  quoteEmail: 'quotes@doorbyyou.com',   // PLACEHOLDER — swap for the real sales inbox
  // plain-language explainers shown as ? tooltips on the option rows
  help: {
    config: 'Sidelites are the narrow glass panels installed beside the door. They brighten the entry and make the unit wider.',
    glass: 'Decorative glass goes into the sidelites and transom — the door slab itself stays solid.',
    transom: 'A transom is the glass panel above the door that brings extra daylight into the entry. Straight or arched.',
    grooves: 'The grooves are the recessed lines that form the door design. Keep them natural, or paint them black for extra contrast.',
    handleSide: 'Which side the handle sits on, viewed from outside as the door swings in.',
    jamb: 'The jamb is the frame depth, matched to your wall: 4-9/16 in. suits a standard 2×4 wall, 6-9/16 in. a 2×6 wall, 7-9/16 in. thicker insulated walls.',
    brickmould: 'Brick mould is the exterior trim that frames the door against your siding or brick. 2 in. wide × 1 in. thick.',
    hinge: 'Hinge finish sets the hardware tone. Concealed hinges hide all hardware when the door is closed.',
    grain: 'The texture embossed into the fibreglass skin. Wood grains are made to stain; smooth is made to paint.',
    slab: 'The slab is the door panel itself, measured before the frame is added. Sidelite and transom glass sizes adjust automatically to the slab you pick.',
    threshold: 'The threshold (sill) is the plate the door closes onto at the floor. Mill is a brushed-aluminum finish; black matches dark frames.',
    frameFinish: 'The finish texture of the frame and jambs — smooth for painted frames, wood grain to match a stained slab.',
    swing: 'Handing is always viewed from the OUTSIDE of your home. Inswing doors open into the house; outswing doors open out toward you.',
    interior: 'The colour of the inside face of your door. White is standard; match the exterior or pick any colour.',
    glassSafety: 'All doorbyyou glass comes standard with safety tempered glass.',
    tlever: 'The T-lever is the interior thumb-turn that works the multipoint lock when the outside handle is a fixed pull bar.',
  },
};

/* Default selection object for a door */
function defaultSel(door) {
  let fin = CONFIG.finishKeys.indexOf(door.finish); if (fin < 0) fin = 0;
  return { config: 0, height: 0, size: 0, finish: fin, frame: fin, glass: 0, transom: 0,
    handle: 0, handleSide: 0, hinge: 0, jamb: 0, brickmould: 0, grooves: 0, region: 0,
    /* guided-wizard keys */
    grain: 0, slabW: 2, frameFinish: 1, threshold: 0, swing: 0,
    interior: 1, interiorC: fin, glassSL: 0, glassTR: 0,   // interior matches exterior until chosen
    hw: 0, mpStyle: 0, barSize: 0, barColor: 0, tLever: 0, dbShape: 0, dbColor: 0 };
}

/* Freight estimate for a selection + destination region */
function shippingFor(sel) {
  const r = CONFIG.shipping.regions[sel.region] || CONFIG.shipping.regions[0];
  return r.base + (CONFIG.shipping.configAdd[sel.config] || 0);
}

/* Total configured price for a door + selection */
function computePrice(door, s) {
  const c = CONFIG.configurations[s.config] || CONFIG.configurations[0];
  // custom sizes price as the nearest standard build-up (final on quote)
  const custom = !!(s.customSize && s.cw && s.ch);
  const h = custom ? (s.ch > 82 ? 1 : 0) : (s.height ? 1 : 0);
  let total = c.frame[h] + c.stain[h];
  total += (CONFIG.sizes[s.size] || { add: 0 }).add;
  total += (CONFIG.glass[s.glass] || { price: 0 }).price;
  total += (CONFIG.transoms[s.transom] || { add: 0 }).add;
  total += (CONFIG.handles[s.handle] || { add: 0 }).add;
  total += (CONFIG.hinges[s.hinge] || { add: 0 }).add;
  total += (CONFIG.jambs[s.jamb] || { add: 0 }).add;
  total += (CONFIG.brickmould[s.brickmould] || { add: 0 }).add;
  total += (CONFIG.paintedGrooves[s.grooves] || { add: 0 }).add;
  /* guided-wizard adders (absent on legacy selections) */
  if (custom) total += (CONFIG.slabWidths.find(x => x.w >= s.cw) || CONFIG.slabWidths[CONFIG.slabWidths.length - 1]).add;
  else if (s.slabW != null) total += (CONFIG.slabWidths[s.slabW] || { add: 0 }).add;
  if (s.glassSL != null && c.sides) total += ((CONFIG.glassStyles[s.glassSL] || { add: 0 }).add) * c.sides;
  if (s.glassTR != null && s.transom) total += (CONFIG.glassStyles[s.glassTR] || { add: 0 }).add;
  if (s.hw != null) total += (CONFIG.hardware.types[s.hw] || { add: 0 }).add;
  if (s.trim === 1 && s.trimFinish != null) total += (CONFIG.trim.finishes[s.trimFinish] || { add: 0 }).add;
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
function glassPanel(x, y, w, h, tint, uid, mullions) {
  if (!tint) return '';
  const dark  = tint === 'tint' || tint === 'privacy' || tint === 'iron';
  const frost = tint === 'etch' || tint === 'frost' || tint === 'privacy'
             || tint === 'granite' || tint === 'chinchilla';
  // tiny deterministic PRNG so textures are stable across re-renders
  let _r = (x * 7919 + y * 104729 + w * 31) % 233280;
  const rnd = () => (_r = (_r * 9301 + 49297) % 233280) / 233280;
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
  // sandblast with 1" clear border: frosted centre, clear band at the edge
  if (tint === 'frost-border') {
    const b = Math.max(6, Math.min(12, w * 0.12));
    s += `<rect x="${x + b}" y="${y + b}" width="${w - 2*b}" height="${h - 2*b}" fill="rgba(244,247,247,.84)"/>`;
    s += `<rect x="${x + b}" y="${y + b}" width="${w - 2*b}" height="${(h - 2*b) * 0.4}" fill="rgba(255,255,255,.14)"/>`;
  }
  // Niagara: soft cascading vertical waves
  if (tint === 'niagara') {
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgba(240,246,247,.4)"/>`;
    for (let xx = x + 6; xx < x + w - 3; xx += 8) {
      const a = 2 + rnd() * 2;
      s += `<path d="M${xx} ${y+2} q${a} ${h/6} 0 ${h/3} q-${a} ${h/6} 0 ${h/3} q${a} ${h/8} 0 ${h/3.2}" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="2.4"/>`;
      s += `<path d="M${xx+1.6} ${y+2} q${a} ${h/6} 0 ${h/3} q-${a} ${h/6} 0 ${h/3} q${a} ${h/8} 0 ${h/3.2}" fill="none" stroke="rgba(0,0,0,.06)" stroke-width="1"/>`;
    }
  }
  // Granite: heavy frost with a coarse speckled texture
  if (tint === 'granite') {
    const n = Math.round((w * h) / 260);
    for (let i = 0; i < n; i++) {
      s += `<circle cx="${x + 3 + rnd() * (w - 6)}" cy="${y + 3 + rnd() * (h - 6)}" r="${0.8 + rnd() * 1.6}" fill="rgba(0,0,0,.10)"/>`;
      s += `<circle cx="${x + 3 + rnd() * (w - 6)}" cy="${y + 3 + rnd() * (h - 6)}" r="${0.7 + rnd() * 1.3}" fill="rgba(255,255,255,.5)"/>`;
    }
  }
  // Chinchilla: fine frosted flecks in loose rows
  if (tint === 'chinchilla') {
    for (let yy = y + 6; yy < y + h - 4; yy += 7) {
      for (let xx = x + 4 + (rnd() * 6); xx < x + w - 6; xx += 9) {
        s += `<path d="M${xx} ${yy} q3 ${rnd() > .5 ? -2.4 : 2.4} 6 0" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.4"/>`;
      }
    }
  }
  // Monumental: large hammered dimples on lightly obscured glass
  if (tint === 'monumental') {
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgba(240,246,247,.5)"/>`;
    const step = Math.max(14, w / 4);
    for (let yy = y + step / 2; yy < y + h - 4; yy += step) {
      for (let xx = x + step / 2 + ((Math.round(yy / step) % 2) * step / 2); xx < x + w - 4; xx += step) {
        s += `<circle cx="${xx}" cy="${yy}" r="${step * 0.34}" fill="rgba(255,255,255,.28)"/>`;
        s += `<circle cx="${xx - step*0.08}" cy="${yy - step*0.08}" r="${step * 0.2}" fill="rgba(255,255,255,.3)"/>`;
        s += `<circle cx="${xx}" cy="${yy}" r="${step * 0.34}" fill="none" stroke="rgba(0,0,0,.07)" stroke-width="1"/>`;
      }
    }
  }
  // Reeded: bold vertical ribs
  if (tint === 'reeded') {
    const rw = Math.max(8, Math.min(14, w / 5));
    for (let xx = x; xx < x + w; xx += rw) {
      s += `<rect x="${xx}" y="${y}" width="${Math.min(rw, x + w - xx)}" height="${h}" fill="rgba(240,246,247,.28)"/>`;
      s += `<rect x="${xx + rw*0.12}" y="${y}" width="${rw*0.3}" height="${h}" fill="rgba(255,255,255,.42)"/>`;
      s += `<rect x="${xx + rw*0.8}" y="${y}" width="${rw*0.16}" height="${h}" fill="rgba(0,0,0,.08)"/>`;
    }
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
  const cfg = CONFIG.configurations[sel ? sel.config : 0] || CONFIG.configurations[0];
  const tr = CONFIG.transoms[sel ? sel.transom : 0] || CONFIG.transoms[0];
  const gl = CONFIG.glass[sel ? sel.glass : 0] || CONFIG.glass[0];
  const hinge = CONFIG.hinges[sel ? sel.hinge : 0] || CONFIG.hinges[0];
  const handleColor = hinge.swatch;
  /* interior view: interior colour on slab + frame, handle mirrored,
     no exterior-only extras (brickmould, painted grooves) */
  const interiorView = opts.view === 'int';
  const io = CONFIG.interiors[(sel && sel.interior != null) ? sel.interior : 0] || {};
  const intKey = io.same ? finKey
    : io.custom ? CONFIG.finishKeys[(sel && sel.interiorC != null) ? sel.interiorC : 0]
    : (io.key || 'snow-white');
  const dispKey = interiorView ? intKey : finKey;
  let tint = finishTint(dispKey);
  /* grain treatment: each woodgrain has its own skin texture (tinted by the
     stain) with the design's traced grooves drawn on top; a painted colour
     (smooth grain, painted interiors) renders as a flat skin + grooves */
  const gk = (CONFIG.grains[(sel && sel.grain != null) ? sel.grain : 0] || CONFIG.grains[0]).key;
  const skinHref = gk === 'mahogany' ? 'images/skin-mahogany.jpg' : 'images/skin-oak.jpg';
  /* finishTint assumes a 0.55-mean-luma skin (lvl = swatch/0.55). Oak (0.577
     mean) corrects to that baseline so stains land on their swatch. Mahogany
     (0.338 mean, mild gamma keeps its figure) deliberately runs UNcorrected:
     real mahogany is a darker wood, so every stain renders richer and deeper
     on it — forcing swatch parity flattened the grain to nothing. */
  const skinLevel = gk === 'mahogany' ? 1.0 : 0.953;
  const skinContrast = gk === 'mahogany' ? 1.05 : 1.05;
  // opts.noGrain: skin not chosen yet — render a neutral unfinished slab
  const isStainShown = !opts.noGrain && !!(FINISHES[dispKey] || {}).stain;
  if (tint && gk === 'mahogany' && (FINISHES[dispKey] || {}).stain) {
    const n = parseInt(tint.color.slice(1), 16), mix = (a, b) => Math.round(a + (b - a) * 0.3);
    tint = { color: '#' + ((1 << 24) + (mix((n >> 16) & 255, 122) << 16) + (mix((n >> 8) & 255, 63) << 8)
      + mix(n & 255, 43)).toString(16).slice(1), lvl: tint.lvl };
  }
  const frameKey = interiorView ? intKey
    : (sel && sel.frame != null ? CONFIG.finishKeys[sel.frame] : finKey);
  /* when the frame colour matches the slab, render it in the slab's actual
     displayed tone (tint + grain cast, or the paint) so they read as one unit */
  const frameColor = opts.noGrain ? ((finishTint(door.finish) || {}).color || '#cfc8b8')
    : (!interiorView && frameKey === finKey)
    ? (gk === 'smooth' ? ((FINISHES[dispKey] || {}).swatch || '#ECEAE1')
      : (tint ? tint.color : (FINISHES[frameKey] || {}).swatch || '#fbfaf6'))
    : (FINISHES[frameKey] || {}).swatch || '#fbfaf6';
  /* frame in wood: a stained frame renders the grain skin tinted in its stain
     (matching the slab by default); a painted frame stays a flat colour */
  let fTint = (frameKey === finKey && !interiorView) ? tint : finishTint(frameKey);
  if (fTint && fTint !== tint && gk === 'mahogany' && (FINISHES[frameKey] || {}).stain) {
    const n2 = parseInt(fTint.color.slice(1), 16), mx = (a, b) => Math.round(a + (b - a) * 0.3);
    fTint = { color: '#' + ((1 << 24) + (mx((n2 >> 16) & 255, 122) << 16) + (mx((n2 >> 8) & 255, 63) << 8)
      + mx(n2 & 255, 43)).toString(16).slice(1), lvl: fTint.lvl };
  }
  // Frame-finish choice: 'Wood grain' textures the frame (any colour — stain or
  // paint shows over the grain), 'Smooth' keeps it flat
  const frameGrainy = ((CONFIG.frameFinishes[(sel && sel.frameFinish != null) ? sel.frameFinish : 1] || {}).key) !== 'smooth';
  const frameWood = !opts.noGrain && frameGrainy && gk !== 'smooth' && !!fTint;
  const frameFill = frameWood ? `url(#ftex-${uid})` : frameColor;
  const groovesPainted = !interiorView && !!(CONFIG.paintedGrooves[sel ? sel.grooves : 0] || {}).painted;
  // smooth skin: true paint colour + groove/highlight tones scaled to its lightness
  const paintHex = opts.noGrain ? '#DED8CB' : ((FINISHES[dispKey] || {}).swatch || '#ECEAE1');
  const pn = parseInt(paintHex.slice(1), 16);
  const paintLuma = (0.299 * (pn >> 16 & 255) + 0.587 * (pn >> 8 & 255) + 0.114 * (pn & 255)) / 255;
  const smoothGroove = groovesPainted ? 'rgba(0,0,0,.82)' : paintLuma > 0.55 ? 'rgba(0,0,0,.30)' : 'rgba(0,0,0,.48)';
  const smoothHigh = paintLuma > 0.55 ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.25)';
  const brick = !interiorView && !!(CONFIG.brickmould[sel ? sel.brickmould : 0] || {}).on;
  const extHandLeft = (CONFIG.handleSides[sel ? sel.handleSide : 0] || {}).side === 'left';
  const handLeft = interiorView ? !extHandLeft : extHandLeft;
  // per-zone glass styles from the guided wizard (fall back to the legacy single pick)
  const styleTint = (i) => (CONFIG.glassStyles[i] || {}).tint;
  const slTint = sel && sel.glassSL != null ? styleTint(sel.glassSL) : (gl.tint || 'etch');
  const trTint = sel && sel.glassTR != null ? styleTint(sel.glassTR) : (gl.tint || 'clear');
  const thr = CONFIG.thresholds[(sel && sel.threshold != null) ? sel.threshold : 0] || CONFIG.thresholds[0];

  const dbl = !!cfg.dbl;
  /* real-size geometry: px-per-inch anchored at 79" = 470u, so slab width,
     height, transom and hardware all draw true to the chosen sizes */
  const PPI = 470 / 79;
  const slabWIn = (sel && sel.customSize && sel.cw) ? sel.cw
    : ((CONFIG.slabWidths[(sel && sel.slabW != null) ? sel.slabW : 2] || {}).w || 36);
  const slabHIn = (sel && sel.customSize && sel.ch) ? sel.ch
    : ((CONFIG.slabHeights[(sel && sel.height != null) ? sel.height : 0] || {}).hIn || 79);
  const DHu = Math.round(slabHIn * PPI);
  const leafW = Math.round(slabWIn * PPI);
  const DWd = dbl ? leafW * 2 + 6 : leafW;   // door footprint width
  // a single sidelite sits left or right per sel.slSide (mirrored in interior view)
  const oneSL = cfg.sides === 1;
  const slRightExt = oneSL && sel && sel.slSide === 1;
  const slRight = interiorView ? oneSL && !slRightExt : slRightExt;
  const leftS = cfg.sides >= 2 || (oneSL && !slRight), rightS = cfg.sides >= 2 || (oneSL && slRight);
  const hasSL = leftS || rightS;
  const FR = 13;                       // uniform jamb / mullion thickness
  const SG = 62;                       // sidelite glass width (~10.4")
  const leftPad  = leftS  ? FR + SG + FR : (hasSL ? FR : 0);
  const rightPad = rightS ? FR + SG + FR : (hasSL ? FR : 0);
  const doorX = leftPad;
  const totalW = leftPad + DWd + rightPad;
  // transom spans the unit's frame line (no-sidelite units carry a 12u frame of
  // their own); brickmould wraps AROUND the unit and never resizes the transom
  const trExt = hasSL ? 0 : 12;
  const trW = totalW + trExt * 2, tx0 = -trExt;
  // semi-circle: true half-circle up to a 30" rise, then a capped ellipse on wide units
  const trH = tr.h ? (tr.arch ? Math.min(Math.round(trW / 2), Math.round(30 * PPI)) : Math.round(16 * PPI)) : 0;
  const topY = trH;   // transom mulls directly onto the frame below — no air gap
  const slabY = topY + (hasSL ? FR : 0);
  const totalH = slabY + DHu;   // open threshold — no bottom rail under the slab

  const faceGrad = `<linearGradient id="face-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${st[0]}"/><stop offset=".42" stop-color="${st[1]}"/>
      <stop offset=".72" stop-color="${st[2]}"/><stop offset="1" stop-color="${st[3]}"/></linearGradient>`;

  /* ---- hardware, drawn to scale from the wizard selection ----
     exterior: pull bar (48/60/72"), gripset, lever, keypad, or prep-only bores
     interior: T-lever / lever + thumbturn, matching the chosen set */
  const HWC = CONFIG.hardware;
  const hwType = (HWC.types[sel && sel.hw != null ? sel.hw : 0] || {}).key || 'mp';
  const mpStyle = (HWC.mpStyles[sel && sel.mpStyle != null ? sel.mpStyle : 0] || {}).key || 'bar';
  const inch = DHu / slabHIn;   // = PPI; hardware draws in true inches
  const barIn = [48, 60, 72][sel && sel.barSize != null ? sel.barSize : 0] || 48;
  const barCol = (HWC.barColors[sel && sel.barColor != null ? sel.barColor : 0] || {}).swatch || '#222224';
  const dbSquare = (sel && sel.dbShape != null ? sel.dbShape : 0) === 0;
  const dbCol = (HWC.dbColors[sel && sel.dbColor != null ? sel.dbColor : 0] || {}).swatch || '#222224';
  const tSquare = (sel && sel.tLever != null ? sel.tLever : 0) === 0;
  function hardware(hx, lx, lw) {
    const cx = hx + 3;                                  // hardware centerline
    const dir = cx < lx + lw / 2 ? 1 : -1;              // lever arm points into the door
    const edge = `stroke="rgba(0,0,0,.25)" stroke-width="1"`;
    const rose = (cy, col, square, r) => square
      ? `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" rx="2.5" fill="${col}" ${edge}/>`
      : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}" ${edge}/>`;
    const keyway = (cy, ox = 0) => `<circle cx="${cx + ox}" cy="${cy}" r="4.5" fill="rgba(0,0,0,.38)"/>
      <rect x="${cx + ox - 1}" y="${cy - 3}" width="2" height="6" rx="1" fill="rgba(255,255,255,.5)"/>`;
    const thumbturn = (cy, col, square) => rose(cy, col, square, 9) +
      `<rect x="${cx - 2.5}" y="${cy - 7}" width="5" height="14" rx="2.5" fill="rgba(255,255,255,.35)"/>`;
    const lever = (cy, col) => rose(cy, col, false, 11) +
      `<rect x="${dir > 0 ? cx - 3 : cx - 33 + 3}" y="${cy - 3.5}" width="33" height="7" rx="3.5" fill="${col}" ${edge}/>`;
    const bar = (col) => {
      const L = barIn * inch, y0 = DHu / 2 - L / 2;
      return `<circle cx="${cx}" cy="${y0 + L * .12}" r="4.5" fill="rgba(0,0,0,.3)"/>
        <circle cx="${cx}" cy="${y0 + L * .88}" r="4.5" fill="rgba(0,0,0,.3)"/>
        <rect x="${cx - 3.5}" y="${y0}" width="7" height="${L}" rx="3.5" fill="${col}" ${edge}/>
        <rect x="${cx - 2.2}" y="${y0 + 1.5}" width="2.6" height="${L - 3}" rx="1.3" fill="rgba(255,255,255,.28)"/>`;
    };
    const barTopY = () => DHu / 2 - (barIn * inch) / 2;
    if (hwType === 'none') {
      // prep only — double bore
      return `<circle cx="${cx}" cy="${DHu / 2 - 40}" r="7" fill="rgba(0,0,0,.13)" ${edge}/>
        <circle cx="${cx}" cy="${DHu / 2}" r="7" fill="rgba(0,0,0,.13)" ${edge}/>`;
    }
    if (interiorView) {
      if (hwType === 'ball') return bar(barCol) + thumbturn(Math.max(34, barTopY() - 16), dbCol, dbSquare);
      if (hwType === 'mp' && mpStyle === 'bar') {
        // T-lever drives the multipoint from inside
        return thumbturn(DHu / 2 - 46, barCol, tSquare) + rose(DHu / 2, barCol, tSquare, 10) +
          `<rect x="${cx - 13}" y="${DHu / 2 - 13}" width="26" height="6" rx="3" fill="${barCol}" ${edge}/>
           <rect x="${cx - 3}" y="${DHu / 2 - 10}" width="6" height="24" rx="3" fill="${barCol}" ${edge}/>`;
      }
      if (hwType === 'digital') return `<rect x="${cx - 9}" y="${DHu / 2 - 62}" width="18" height="40" rx="4" fill="#2a2a2c" ${edge}/>` +
        thumbturn(DHu / 2 - 52, '#3a3a3d', false) + lever(DHu / 2, handleColor);
      return thumbturn(DHu / 2 - 46, handleColor, dbSquare) + lever(DHu / 2, handleColor);
    }
    if (hwType === 'ball') return bar(barCol) + rose(Math.max(34, barTopY() - 16), dbCol, dbSquare, 10) + keyway(Math.max(34, barTopY() - 16));
    if (hwType === 'digital') {
      const ky = DHu / 2 - 60;
      const dots = [0, 1, 2].map(r => [0, 1, 2].map(c =>
        `<circle cx="${cx - 5 + c * 5}" cy="${ky + 8 + r * 6}" r="1.3" fill="rgba(255,255,255,.75)"/>`).join('')).join('');
      return `<rect x="${cx - 10}" y="${ky}" width="20" height="34" rx="4" fill="#2a2a2c" ${edge}/>${dots}
        <rect x="${cx - 6}" y="${ky + 26}" width="12" height="3.5" rx="1.75" fill="rgba(255,255,255,.3)"/>` +
        lever(DHu / 2, handleColor);
    }
    if (mpStyle === 'grip') {
      // handleset: backplate, thumb-latch grip, keyed cylinder up top
      return `<rect x="${cx - 5.5}" y="${DHu / 2 - 66}" width="11" height="118" rx="5" fill="${handleColor}" ${edge}/>` +
        keyway(DHu / 2 - 56) +
        `<ellipse cx="${cx}" cy="${DHu / 2 - 44}" rx="8" ry="4" fill="${handleColor}" ${edge}/>
         <path d="M ${cx} ${DHu / 2 - 40} Q ${cx + dir * 17} ${DHu / 2} ${cx} ${DHu / 2 + 42}" fill="none" stroke="${handleColor}" stroke-width="7.5" stroke-linecap="round"/>
         <path d="M ${cx} ${DHu / 2 - 40} Q ${cx + dir * 17} ${DHu / 2} ${cx} ${DHu / 2 + 42}" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="2.5" stroke-linecap="round"/>`;
    }
    if (mpStyle === 'lever') return rose(DHu / 2 - 34, handleColor, false, 8) + keyway(DHu / 2 - 34) + lever(DHu / 2, handleColor);
    // multipoint pull bar + keyed cylinder beside it
    return bar(barCol) + `<circle cx="${cx + dir * 15}" cy="${DHu / 2}" r="7" fill="${barCol}" ${edge}/>` + keyway(DHu / 2, dir * 15);
  }

  // one door leaf: slab (tinted render or gradient) + edge + handle
  function leaf(x, w, handleX) {
    const cid = 'c' + uid + 'x' + Math.round(x);
    // routed grooves: slim dark line with a light chamfer glint beneath, both
    // passes clipped to the slab; painted-grooves mode inks the dark pass solid
    const slim = (svg) => svg.replace(/stroke-width="4"/g, 'stroke-width="2.2"').replace(/stroke-width="3"/g, 'stroke-width="1.8"');
    const gCol = isStainShown
      ? (groovesPainted ? 'rgba(0,0,0,.85)' : 'rgba(38,16,5,.55)')
      : smoothGroove;
    const hCol = isStainShown ? 'rgba(255,236,210,.26)' : smoothHigh;
    const grooveLayer = `<g clip-path="url(#${cid})"><g transform="translate(${x},0) scale(${(w / DW).toFixed(4)},${(DHu / 470).toFixed(4)})">
        <g transform="translate(0,1.7)">${slim(patternSVG(door.pattern, hCol, 'rgba(0,0,0,0)'))}</g>
        ${slim(patternSVG(door.pattern, gCol, 'rgba(0,0,0,0)'))}
      </g></g>`;
    const face = door.image
      ? `<clipPath id="${cid}"><rect x="${x}" y="0" width="${w}" height="${DHu}" rx="3"/></clipPath>` + (
        opts.noGrain
        // grain not chosen yet — show the design exactly as its catalog photo
        ? `<g clip-path="url(#${cid})"><image href="${door.image}" x="${x}" y="0" width="${w}" height="${DHu}" preserveAspectRatio="xMidYMid slice"/></g>`
        : !isStainShown
        // painted skin (smooth grain, painted interiors): flat colour + grooves
        ? `<rect x="${x}" y="0" width="${w}" height="${DHu}" rx="3" fill="${paintHex}"/>` + grooveLayer
        // stained woodgrain: the grain's skin texture tinted by the stain + grooves
        : `<g clip-path="url(#${cid})" style="isolation:isolate">
            <rect x="${x}" y="0" width="${w}" height="${DHu}" fill="${tint ? tint.color : '#bdb7a8'}"/>
            <image href="${skinHref}" x="${x}" y="0" width="${w}" height="${DHu}" preserveAspectRatio="xMidYMid slice" style="filter:grayscale(1) brightness(${((tint ? tint.lvl : 1) * skinLevel).toFixed(3)}) contrast(${skinContrast});mix-blend-mode:luminosity"/>
          </g>` + grooveLayer)
      : `<rect x="${x}" y="0" width="${w}" height="${DHu}" rx="3" fill="url(#face-${uid})"/>`;
    return `
      ${face}
      <rect x="${x}" y="0" width="${w}" height="${DHu}" rx="3" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1.5"/>
      ${opts.noHandle ? '' : hardware(handleX, x, w)}`;
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
      // true semi-circle transom: half-circle spanning the framed width
      frames += `<path d="M${tx0} ${trH} A ${trW/2} ${trH} 0 0 1 ${tx0 + trW} ${trH} Z" fill="${frameFill}" stroke="rgba(0,0,0,.14)" stroke-width="2"/>`;
      frames += `<path d="M${tx0 + 12} ${trH} A ${trW/2 - 12} ${trH - 11} 0 0 1 ${tx0 + trW - 12} ${trH} Z" fill="${glassFill(trTint || 'clear', uid)}"/>`;
      frames += `<path d="M${tx0 + 12} ${trH} A ${trW/2 - 12} ${trH - 11} 0 0 1 ${tx0 + trW - 12} ${trH} Z" fill="rgba(255,255,255,.14)"/>`;
    } else if (tr.seg) {
      // segmental: shallow-rise curved top over a low rectangle
      frames += `<path d="M${tx0} ${trH} L${tx0} 42 Q${tx0 + trW/2} -12 ${tx0 + trW} 42 L${tx0 + trW} ${trH} Z" fill="${frameFill}" stroke="rgba(0,0,0,.14)" stroke-width="2"/>`;
      frames += `<path d="M${tx0 + 10} ${trH - 8} L${tx0 + 10} 46 Q${tx0 + trW/2} 0 ${tx0 + trW - 10} 46 L${tx0 + trW - 10} ${trH - 8} Z" fill="${glassFill(trTint || 'clear', uid)}"/>`;
      frames += `<path d="M${tx0 + 10} ${trH - 8} L${tx0 + 10} 46 Q${tx0 + trW/2} 0 ${tx0 + trW - 10} 46 L${tx0 + trW - 10} ${trH - 8} Z" fill="rgba(255,255,255,.14)"/>`;
    } else {
      frames += `<rect x="${tx0}" y="0" width="${trW}" height="${trH}" rx="2" fill="${frameFill}" stroke="rgba(0,0,0,.14)" stroke-width="2"/>`;
      frames += glassPanel(tx0 + 8, 8, trW - 16, trH - 16, trTint || 'clear', uid, false);
    }
  }
  // unified jamb behind the door + sidelites, so every mullion is equal width
  if (hasSL) {
    frames += `<rect x="0" y="${topY}" width="${totalW}" height="${DHu + FR}" rx="4" fill="${frameFill}" stroke="rgba(0,0,0,.14)" stroke-width="2"/>`;
  }
  if (leftS)  frames += glassPanel(FR, slabY, SG, DHu, slTint || 'etch', uid, true);
  if (rightS) frames += glassPanel(totalW - FR - SG, slabY, SG, DHu, slTint || 'etch', uid, true);

  /* dimension callouts (configurator live preview)
     opts.dims = {w, roW, h, roH, door?, sl?} display strings */
  let dims = '', vy = trH ? -24 : -14, vw = totalW + 40, vh = totalH + 34;
  if (opts.dims) {
    const D = opts.dims;
    const fx0 = hasSL ? 0 : doorX - 12, fx1 = hasSL ? totalW : doorX + DWd + 12;
    const fy0 = trH ? 0 : slabY - 6, fy1 = totalH + 5;
    const dc = '#443f35', rc = '#3d6274';
    const tick = (x, y, vert) => vert
      ? `<line x1="${x - 5}" y1="${y}" x2="${x + 5}" y2="${y}"/>`
      : `<line x1="${x}" y1="${y - 5}" x2="${x}" y2="${y + 5}"/>`;
    // halo stroke behind the glyphs keeps labels readable over lines and ticks
    const txt = (col) => `fill="${col}" font-size="14" font-weight="600" text-anchor="middle"
      font-family="ui-monospace,SFMono-Regular,Menlo,monospace" letter-spacing=".04em"
      stroke="#f1ece2" stroke-width="4" paint-order="stroke" stroke-linejoin="round"`;
    const hdim = (y, x0, x1, label, col) => `<g stroke="${col}" stroke-width="1.3">
        <line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}"/>${tick(x0, y)}${tick(x1, y)}
      </g><text x="${(x0 + x1) / 2}" y="${y - 6}" ${txt(col)}>${label}</text>`;
    const vdim = (x, label, col) => `<g stroke="${col}" stroke-width="1.3">
        <line x1="${x}" y1="${fy0}" x2="${x}" y2="${fy1}"/>${tick(x, fy0, 1)}${tick(x, fy1, 1)}
      </g><text transform="translate(${x - 6},${(fy0 + fy1) / 2}) rotate(-90)" ${txt(col)}>${label}</text>`;
    // segment tier: sidelite · door · sidelite widths (only when sidelites exist)
    let y = fy0 - 16;
    if (hasSL && D.door) {
      if (leftS)  dims += hdim(y, 0, doorX, D.sl, dc);
      dims += hdim(y, doorX, doorX + DWd, D.door, dc);
      if (rightS) dims += hdim(y, doorX + DWd, totalW, D.sl, dc);
      y -= 25;
    }
    dims += hdim(y, fx0, fx1, D.w, dc);
    dims += hdim(y - 25, fx0, fx1, 'R.O. ' + D.roW, rc);
    dims += vdim(fx1 + 19, D.h, dc) + vdim(fx1 + 44, 'R.O. ' + D.roH, rc);
    const top = y - 25 - 22;
    if (top < vy) { vh += vy - top; vy = top; }
    vw += 60;
  }
  return `
  <svg class="door-svg unit" viewBox="-20 ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    ${dims}
    <defs>${faceGrad}${glassDefs(uid)}
      <linearGradient id="floor-${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="rgba(0,0,0,.12)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></linearGradient>
      ${frameWood ? `<pattern id="ftex-${uid}" patternUnits="userSpaceOnUse" x="-20" y="-30" width="${totalW + 48}" height="${totalH + 60}">
        <g style="isolation:isolate"><rect width="${totalW + 48}" height="${totalH + 60}" fill="${fTint.color}"/>
        <image href="${skinHref}" width="${totalW + 48}" height="${totalH + 60}" preserveAspectRatio="xMidYMid slice" style="filter:grayscale(1) brightness(${(parseFloat(fTint.lvl) * skinLevel).toFixed(3)}) contrast(${skinContrast});mix-blend-mode:luminosity"/></g>
      </pattern>` : ''}
    </defs>
    ${brick ? `<rect x="-14" y="${trH && (tr.arch || tr.seg) ? trH - 4 : -8}" width="${totalW+28}" height="${(trH && (tr.arch || tr.seg) ? totalH - trH + 4 : totalH) + 16}" rx="3" fill="${frameFill}" stroke="rgba(0,0,0,.22)" stroke-width="2"/>` : ''}
    ${frames}
    <g transform="translate(${doorX}, ${slabY})">
      ${(opts.bare || hasSL) ? '' : `<rect x="-12" y="-6" width="${DWd+24}" height="${DHu+10}" rx="2" fill="${frameFill}" stroke="rgba(0,0,0,.1)" stroke-width="1"/>`}
      ${leaves}
    </g>
    ${opts.bare ? '' : `<rect x="${doorX - 4}" y="${totalH - 2}" width="${DWd + 8}" height="7" rx="1.5" fill="${thr.swatch}"/>
    <rect x="${doorX - 4}" y="${totalH - 2}" width="${DWd + 8}" height="2" rx="1" fill="rgba(255,255,255,.35)"/>`}
    ${opts.bare ? '' : `<ellipse cx="${totalW/2}" cy="${totalH+14}" rx="${totalW/2+8}" ry="9" fill="url(#floor-${uid})"/>`}
  </svg>`;
}

/* ---- option-row accessibility: radio semantics + arrow-key navigation ---- */
const OPT_LABELS = {
  config: 'Configuration', height: 'Height', size: 'Size', finish: 'Slab colour',
  frame: 'Frame colour', grooves: 'Painted grooves', glass: 'Decorative glass',
  transom: 'Transom', handle: 'Handle and lock', handleSide: 'Handle side',
  hinge: 'Hinges', jamb: 'Jamb size', brickmould: 'Brick mould', region: 'Ship to',
  grain: 'Grain', slabW: 'Slab width', height2: 'Slab height', frameFinish: 'Frame finish', slSide: 'Sidelite side',
  threshold: 'Threshold / sill', swing: 'Swing and hinging', interior: 'Interior colour',
  interiorC: 'Interior custom colour', glassSL: 'Sidelite glass', glassTR: 'Transom glass',
  hw: 'Hardware package', mpStyle: 'Multipoint style', barSize: 'Pull bar size',
  barColor: 'Pull bar colour', tLever: 'T-lever', dbShape: 'Deadbolt shape', dbColor: 'Deadbolt colour',
  trim: 'Interior trim', trimFinish: 'Trim finish', trimStyle: 'Trim style', trimSize: 'Trim size',
};
function optA11y(root) {
  root.querySelectorAll('.opt-row').forEach(row => {
    row.setAttribute('role', 'radiogroup');
    row.setAttribute('aria-label', OPT_LABELS[row.dataset.key] || row.dataset.key);
    row.querySelectorAll('[data-i]').forEach(b => {
      const on = b.classList.contains('on');
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', on);
      b.tabIndex = on ? 0 : -1;
      if (!b.getAttribute('aria-label') && b.title) b.setAttribute('aria-label', b.title);
    });
  });
}
function optKeyboardNav(root) {
  if (root._optNav) return;   // bind once per container — content re-renders, container persists
  root._optNav = true;
  root.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    const row = e.target.closest && e.target.closest('.opt-row');
    if (!row) return;
    const btns = [...row.querySelectorAll('[data-i]')];
    const cur = btns.indexOf(e.target);
    if (cur < 0) return;
    e.preventDefault();
    const dir = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
    btns[(cur + dir + btns.length) % btns.length].click();
    const fresh = root.querySelector(`.opt-row[data-key="${row.dataset.key}"] .on`);
    if (fresh) fresh.focus();
  });
}

window.PANES = {
  DOORS, FINISHES, CONFIG,
  doorSceneHTML, patternSVG, unitSVG,
  glassPanel, glassDefs, finishTint,
  defaultSel, computePrice, shippingFor, specsFor,
  optA11y, optKeyboardNav,
};
