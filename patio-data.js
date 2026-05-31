/* ============================================================
   PANES — Patio Doors catalog + renderer
   Sliding / French / Bi-Fold / Pocket glass door systems.
   Representative demo data; renders as CSS/SVG glass panels.
   ============================================================ */
(function () {
  const FIN = window.PANES.FINISHES;

  const PATIO = [
    { name: 'Two Panel Slider',  type: 'Sliding',  panels: 2, op: 'OX', price: 1940, finish: 'black',  desc: 'Classic two-panel slider — one fixed lite, one gliding panel on tandem rollers.' },
    { name: 'Three Panel Slider',type: 'Sliding',  panels: 3, op: 'OXO',price: 2760, finish: 'iron',   desc: 'Wide three-panel slider with a central operating panel and twin fixed lites.' },
    { name: 'Four Panel Slider', type: 'Sliding',  panels: 4, op: 'OXXO',price: 3480, finish: 'black',  desc: 'Expansive four-panel run for full-width openings and panoramic views.' },
    { name: 'French Patio',      type: 'French',   panels: 2, op: 'FR', price: 2540, finish: 'white',   desc: 'Hinged double doors with a true French swing and multi-point locking.' },
    { name: 'Pocket Slider',     type: 'Pocket',   panels: 3, op: 'POC',price: 4120, finish: 'bronze',  desc: 'Panels disappear into the wall pocket for a seamless indoor-outdoor threshold.' },
    { name: 'Bi-Fold Wall',      type: 'Bi-Fold',  panels: 4, op: 'BIF',price: 5260, finish: 'iron',    desc: 'Folding glass wall that stacks fully to one side, opening the entire span.' },
  ];

  const PW = 110;   // per-panel width
  const PH = 360;   // panel height

  function patioSVG(p, finishKey) {
    const f = FIN[finishKey || p.finish] || FIN.black;
    const n = p.panels;
    const totalW = PW * n;
    const frame = f.stops[2];
    const frameLo = f.stops[3];
    const uid = 'p' + Math.random().toString(36).slice(2, 7);
    let panels = '';
    for (let i = 0; i < n; i++) {
      const x = i * PW;
      // operating panel gets a slightly inset highlight + handle
      const moving = (p.op === 'OX' && i === 1) || (p.op === 'OXO' && i === 1)
        || (p.op === 'OXXO' && (i === 1 || i === 2)) || p.type !== 'Sliding';
      panels += `
        <rect x="${x}" y="0" width="${PW}" height="${PH}" fill="url(#pf-${uid})"/>
        <rect x="${x+9}" y="9" width="${PW-18}" height="${PH-18}" fill="url(#pg-${uid})" opacity=".55"/>
        <polygon points="${x+9},${9+(PH-18)*0.6} ${x+PW*0.45},9 ${x+PW*0.7},9 ${x+9},${PH-9}" fill="rgba(255,255,255,.22)"/>
        <rect x="${x+9}" y="9" width="${PW-18}" height="${PH-18}" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="2"/>
        <rect x="${x}" y="0" width="${PW}" height="${PH}" fill="none" stroke="${frameLo}" stroke-width="6"/>`;
      if (p.type === 'French') {
        // hinged handle pair at center
        const hx = i === 0 ? x + PW - 16 : x + 12;
        panels += `<rect x="${hx}" y="${PH/2-26}" width="5" height="52" rx="2.5" fill="${frameLo}"/>`;
      } else if (moving) {
        const hx = (p.op && p.op[i] === 'X') || p.type !== 'Sliding' ? x + 16 : x + PW - 18;
        panels += `<rect x="${x+PW-16}" y="${PH/2-30}" width="5" height="60" rx="2.5" fill="${frameLo}"/>`;
      }
    }
    return `
    <svg class="door-svg" viewBox="-16 -14 ${totalW+32} ${PH+40}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <linearGradient id="pf-${uid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${f.stops[1]}"/><stop offset="1" stop-color="${frameLo}"/></linearGradient>
        <linearGradient id="pg-${uid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#cfdadc"/><stop offset=".5" stop-color="#aebfc4"/><stop offset="1" stop-color="#c6d2d4"/></linearGradient>
        <linearGradient id="pfl-${uid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="rgba(0,0,0,.12)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></linearGradient>
      </defs>
      <rect x="-6" y="-6" width="${totalW+12}" height="${PH+12}" rx="2" fill="none" stroke="${frame}" stroke-width="3"/>
      ${panels}
      <ellipse cx="${totalW/2}" cy="${PH+14}" rx="${totalW/2}" ry="8" fill="url(#pfl-${uid})"/>
    </svg>`;
  }

  window.PANES.PATIO = PATIO;
  window.PANES.patioSVG = patioSVG;
})();
