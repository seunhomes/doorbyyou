/* ============================================================
   PANES — Hardware page logic
   Handle/lock cards, hinge finishes, live sidelite/transom preview.
   ============================================================ */
(function () {
  const P = window.PANES;
  const { DOORS, FINISHES, CONFIG, unitSVG, defaultSel } = P;
  const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: n % 1 ? 2 : 0 });

  /* ---- handle illustrations (simple geometry) ---- */
  const HANDLE_SVG = {
    'H-TP48': `<rect x="40" y="14" width="14" height="72" rx="7" fill="#2b2b2d"/><rect x="44" y="22" width="6" height="56" rx="3" fill="#4a4a4d"/>`,
    'H-SQL': `<rect x="34" y="36" width="14" height="28" rx="3" fill="#2b2b2d"/><rect x="48" y="46" width="22" height="8" rx="2" fill="#2b2b2d"/>`,
    'H-MB60': `<rect x="42" y="8" width="10" height="84" rx="5" fill="#1f1f21"/><rect x="38" y="8" width="18" height="8" rx="3" fill="#1f1f21"/><rect x="38" y="84" width="18" height="8" rx="3" fill="#1f1f21"/>`,
    'H-ESD': `<circle cx="47" cy="40" r="13" fill="none" stroke="#2b2b2d" stroke-width="5"/><rect x="42" y="58" width="10" height="22" rx="3" fill="#2b2b2d"/><circle cx="47" cy="40" r="4" fill="#2b2b2d"/>`,
  };
  function handleArt(sku) {
    return `<svg viewBox="0 0 94 100" preserveAspectRatio="xMidYMid meet">
      <rect x="14" y="0" width="66" height="100" rx="3" fill="#ece6da" stroke="#d3cdbe" stroke-width="1.5"/>
      ${HANDLE_SVG[sku] || ''}</svg>`;
  }

  const handleGrid = document.getElementById('handleGrid');
  handleGrid.innerHTML = CONFIG.handles.map(h => `
    <div class="hw">
      <div class="hs">${handleArt(h.sku)}</div>
      <div class="ht"><b>${h.label}</b>
        <div class="row"><span>Matte finish</span><span class="pr">${h.add ? '+' + fmt(h.add) : 'Included'}</span></div>
      </div>
    </div>`).join('');

  const hingeGrid = document.getElementById('hingeGrid');
  hingeGrid.innerHTML = CONFIG.hinges.map(h => `
    <div class="hinge">
      <div class="dot" style="background:${h.swatch}"></div>
      <div><b>${h.label}</b><span>4" ball-bearing · ${h.add ? '+' + fmt(h.add) : 'Included'}</span></div>
    </div>`).join('');

  /* ---- live sidelite / transom preview ---- */
  const door = DOORS.find(d => d.name === 'Quattro') || DOORS[0];
  const sel = defaultSel(door);
  sel.glass = 1; // clear lite so surrounds read as glass
  const preview = document.getElementById('stPreview');

  function paint() { preview.innerHTML = unitSVG(door, sel); }

  function buildRow(elId, items, key, withPrice) {
    const el = document.getElementById(elId);
    el.innerHTML = items.map((it, i) =>
      `<button class="opt-btn ${i === sel[key] ? 'on' : ''}" data-i="${i}">${it.label}${withPrice && it.add ? ' +' + fmt(it.add) : ''}</button>`).join('');
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-i]'); if (!b) return;
      sel[key] = +b.dataset.i;
      el.querySelectorAll('.opt-btn').forEach((x, i) => x.classList.toggle('on', i === sel[key]));
      paint();
    });
  }
  buildRow('slRow', CONFIG.sidelites, 'sidelite', true);
  buildRow('trRow', CONFIG.transoms, 'transom', true);
  buildRow('glRow', CONFIG.glass, 'glass', true);

  // default to a flattering combo
  sel.sidelite = 2; sel.transom = 1;
  document.querySelectorAll('#slRow .opt-btn').forEach((x, i) => x.classList.toggle('on', i === sel.sidelite));
  document.querySelectorAll('#trRow .opt-btn').forEach((x, i) => x.classList.toggle('on', i === sel.transom));
  paint();
})();
