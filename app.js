/* ============================================================
   PANES Entry Doors — app logic: render grid, filter, sort,
   quick-view modal with a live size/color/glass configurator.
   ============================================================ */
(function () {
  const P_ = window.PANES;
  const { DOORS, FINISHES, CONFIG, doorSceneHTML, unitSVG, computePrice, defaultSel } = window.PANES;
  const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: n % 1 ? 2 : 0 });

  const grid = document.getElementById('grid');
  const countEl = document.getElementById('count');
  const sortSel = document.getElementById('sort');

  let state = { mat: 'all', style: 'all', sort: 'featured' };

  /* swatch dots shown on each card (a few finish options) */
  function swatchDots(d) {
    const opts = ['natural', 'golden-oak', 'walnut-stain', 'espresso'];
    return opts.map(k => `<span class="sw" title="${FINISHES[k].label}" style="background:${FINISHES[k].swatch}"></span>`).join('');
  }

  function cardHTML(d, i) {
    return `<article class="card" data-i="${i}">
      <div class="stage">
        <span class="badge">${d.material}</span>
        <span class="qv" title="Quick view"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4" stroke-linecap="round"/></svg></span>
        ${doorSceneHTML(d)}
      </div>
      <div class="info">
        <div class="top">
          <div class="name">${d.name}</div>
          <div class="price">${fmt(computePrice(d, defaultSel(d)))}</div>
        </div>
        <div class="top">
          <div class="from">${d.style}</div>
          <div class="from">Starting from</div>
        </div>
        <div class="desc">${d.desc}</div>
        <div class="swatches">${swatchDots(d)}<span class="meta">${d.material === 'Steel' ? 'Steel' : 'Fiberglass'}</span></div>
      </div>
    </article>`;
  }

  function applied() {
    let list = DOORS.map((d, i) => ({ d, i }));
    if (state.mat !== 'all') list = list.filter(o => o.d.material === state.mat);
    if (state.style !== 'all') list = list.filter(o => o.d.style === state.style);
    if (state.sort === 'price-asc') list.sort((a, b) => a.d.price - b.d.price);
    else if (state.sort === 'price-desc') list.sort((a, b) => b.d.price - a.d.price);
    else if (state.sort === 'az') list.sort((a, b) => a.d.name.localeCompare(b.d.name));
    return list;
  }

  function render() {
    const list = applied();
    grid.innerHTML = list.map(o => cardHTML(o.d, o.i)).join('');
    countEl.textContent = list.length + ' door' + (list.length === 1 ? '' : 's');
  }

  /* ---- filter chip groups ---- */
  function wireChips(containerId, key) {
    const c = document.getElementById(containerId);
    c.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      c.querySelectorAll('.chip').forEach(x => x.classList.remove('on'));
      btn.classList.add('on');
      state[key] = btn.dataset[key === 'mat' ? 'mat' : 'style'];
      render();
    });
  }
  wireChips('matChips', 'mat');
  wireChips('styleChips', 'style');
  sortSel.addEventListener('change', () => { state.sort = sortSel.value; render(); });

  /* ============================================================
     Quick-view modal + configurator
     ============================================================ */
  const overlay = document.getElementById('overlay');
  const mDoor = document.getElementById('mDoor');
  const mInfo = document.getElementById('mInfo');
  document.getElementById('mClose').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  let cfg = null; // { door, sel }

  function priceNow() { return computePrice(cfg.door, cfg.sel); }

  function paintDoor() {
    mDoor.innerHTML = unitSVG(cfg.door, cfg.sel);
    const svg = mDoor.querySelector('svg'); if (svg) { svg.style.height = '460px'; svg.style.width = 'auto'; }
  }

  function mOptRow(items, key, render) {
    return `<div class="opt-row" data-key="${key}">${items.map((it, i) => render(it, i, i === cfg.sel[key])).join('')}</div>`;
  }

  function paintInfo() {
    const d = cfg.door, s = cfg.sel, fk = CONFIG.finishKeys;
    mInfo.innerHTML = `
      <div class="eyebrow">${d.material} · ${d.style}</div>
      <h3>${d.name}</h3>
      <p class="m-desc">${d.desc} Finished identically inside and out, prepped for a multi-point lock.</p>
      <div class="m-price">${fmt(priceNow())}<small>Configured price · before tax</small></div>

      <div class="opt"><div class="lbl">Configuration <span>${CONFIG.configurations[s.config].label}</span></div>
        ${mOptRow(CONFIG.configurations, 'config', (x, i, on) => `<button class="opt-btn ${on?'on':''}" data-i="${i}">${x.label}</button>`)}</div>
      <div class="opt"><div class="lbl">Height <span>${CONFIG.heights[s.height].label}</span></div>
        ${mOptRow(CONFIG.heights, 'height', (x, i, on) => `<button class="opt-btn ${on?'on':''}" data-i="${i}">${x.label}</button>`)}</div>
      <div class="opt"><div class="lbl">Stain colour <span>${FINISHES[fk[s.finish]].label}</span></div>
        ${mOptRow(fk, 'finish', (k, i, on) => `<button class="opt-sw ${on?'on':''}" data-i="${i}" title="${FINISHES[k].label}" style="background:${FINISHES[k].swatch}"></button>`)}</div>
      <div class="opt"><div class="lbl">Decorative glass <span>${CONFIG.glass[s.glass].label}</span></div>
        ${mOptRow(CONFIG.glass, 'glass', (g, i, on) => `<button class="opt-btn ${on?'on':''}" data-i="${i}">${g.label}${g.price?' +'+fmt(g.price):''}</button>`)}</div>

      <div class="m-actions">
        <button class="btn solid" id="mAdd">Add to cart · ${fmt(priceNow())}</button>
        <a class="btn ghost" href="Door.html?door=${encodeURIComponent(d.name)}">Full details &amp; options</a>
      </div>
      <div class="m-foot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" stroke-linejoin="round"/></svg>Free US shipping · Lifetime warranty · Multi-point lock standard</div>
    `;
    mInfo.querySelectorAll('.opt-row').forEach(row => row.addEventListener('click', (e) => {
      const b = e.target.closest('[data-i]'); if (!b) return;
      const key = row.dataset.key;
      cfg.sel[key] = +b.dataset.i;
      paintInfo();
      if (key === 'config' || key === 'finish' || key === 'glass') paintDoor();
    }));
    const addBtn = mInfo.querySelector('#mAdd');
    if (addBtn) addBtn.addEventListener('click', () => {
      const finKey = CONFIG.finishKeys[cfg.sel.finish];
      P_.cart.add({
        key: `door-${d.name}-${cfg.sel.config}-${cfg.sel.height}-${finKey}-${cfg.sel.glass}`,
        title: d.name,
        sub: `${CONFIG.configurations[cfg.sel.config].label} · ${FINISHES[finKey].label}`,
        price: priceNow(),
        art: { kind: 'door', name: d.name, finish: finKey },
      });
      P_.cartToast(d.name);
    });
  }

  function openModal(i) {
    const door = DOORS[i];
    cfg = { door, sel: defaultSel(door) };
    paintDoor();
    paintInfo();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.card'); if (!card) return;
    openModal(+card.dataset.i);
  });

  /* hero mini door */
  const heroMini = document.getElementById('hero-mini');
  if (heroMini) {
    const chev = DOORS.find(d => d.name === 'Chevron') || DOORS[0];
    heroMini.innerHTML = doorSceneHTML(chev, { noHandle: true });
  }

  render();
})();
