/* ============================================================
   PANES Entry Doors — app logic: render grid, filter, sort,
   quick-view modal with a live size/color/glass configurator.
   ============================================================ */
(function () {
  const P_ = window.PANES;
  const { DOORS, FINISHES, doorSceneHTML } = window.PANES;
  const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: n % 1 ? 2 : 0 });

  const grid = document.getElementById('grid');
  const countEl = document.getElementById('count');
  const sortSel = document.getElementById('sort');

  let state = { mat: 'all', style: 'all', sort: 'featured' };

  /* swatch dots shown on each card (a few finish options) */
  function swatchDots(d) {
    const opts = ['black', 'white', 'iron', d.finish].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
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
          <div class="price">${fmt(d.price)}</div>
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

  const SIZES = [
    { label: `32" × 6'8"`, mult: 1.00 },
    { label: `36" × 6'8"`, mult: 1.06 },
    { label: `36" × 8'`,   mult: 1.22 },
    { label: `Double 36" × 8'`, mult: 1.95 },
  ];
  const GLASS = [
    { label: 'Solid (no glass)', add: 0 },
    { label: 'Clear Lite', add: 380 },
    { label: 'Sandblasted', add: 520 },
    { label: 'Decorative', add: 740 },
  ];
  const FINISH_KEYS = ['black', 'white', 'iron', 'bronze', 'oak', 'walnut', 'sage'];

  let cfg = null; // {door, size, finish, glass}

  function priceNow() {
    const base = cfg.door.price * SIZES[cfg.size].mult + GLASS[cfg.glass].add;
    return base;
  }

  function paintDoor() {
    const d = Object.assign({}, cfg.door, { finish: FINISH_KEYS[cfg.finish] });
    mDoor.innerHTML = doorSceneHTML(d, { noHandle: false });
    const svg = mDoor.querySelector('svg'); if (svg) { svg.style.height = '480px'; svg.style.width = 'auto'; }
  }

  function paintInfo() {
    const d = cfg.door;
    mInfo.innerHTML = `
      <div class="eyebrow">${d.material} · ${d.style}</div>
      <h3>${d.name}</h3>
      <p class="m-desc">${d.desc} Engineered for security and efficiency, finished identically inside and out.</p>
      <div class="m-price">${fmt(priceNow())}<small>Configured price · before tax</small></div>

      <div class="opt">
        <div class="lbl">Size <span>${SIZES[cfg.size].label}</span></div>
        <div class="opt-row" id="sizeRow">
          ${SIZES.map((s, i) => `<button class="opt-btn ${i === cfg.size ? 'on' : ''}" data-i="${i}">${s.label}</button>`).join('')}
        </div>
      </div>

      <div class="opt">
        <div class="lbl">Finish <span>${FINISHES[FINISH_KEYS[cfg.finish]].label}</span></div>
        <div class="opt-row" id="finRow">
          ${FINISH_KEYS.map((k, i) => `<button class="opt-sw ${i === cfg.finish ? 'on' : ''}" data-i="${i}" title="${FINISHES[k].label}" style="background:${FINISHES[k].swatch}"></button>`).join('')}
        </div>
      </div>

      <div class="opt">
        <div class="lbl">Decorative glass <span>${GLASS[cfg.glass].label}</span></div>
        <div class="opt-row" id="glassRow">
          ${GLASS.map((g, i) => `<button class="opt-btn ${i === cfg.glass ? 'on' : ''}" data-i="${i}">${g.label}${g.add ? ' +' + fmt(g.add) : ''}</button>`).join('')}
        </div>
      </div>

      <div class="m-actions">
        <button class="btn solid" id="mAdd">Add to cart · ${fmt(priceNow())}</button>
        <a class="btn ghost" href="Door.html?door=${encodeURIComponent(d.name)}">Full details &amp; options</a>
      </div>
      <div class="m-foot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" stroke-linejoin="round"/></svg>Free US shipping · Lifetime warranty · Multi-point lock standard</div>
    `;
    mInfo.querySelector('#sizeRow').addEventListener('click', pick('size'));
    mInfo.querySelector('#finRow').addEventListener('click', pick('finish', true));
    mInfo.querySelector('#glassRow').addEventListener('click', pick('glass'));
    const addBtn = mInfo.querySelector('#mAdd');
    if (addBtn) addBtn.addEventListener('click', () => {
      const finKey = FINISH_KEYS[cfg.finish];
      P_.cart.add({
        key: `door-${d.name}-${cfg.size}-${finKey}-${cfg.glass}`,
        title: d.name,
        sub: `${SIZES[cfg.size].label} · ${FINISHES[finKey].label} · ${GLASS[cfg.glass].label}`,
        price: priceNow(),
        art: { kind: 'door', name: d.name, finish: finKey },
      });
      P_.cartToast(d.name);
    });
  }

  function pick(key, repaintDoor) {
    return (e) => {
      const b = e.target.closest('[data-i]'); if (!b) return;
      cfg[key] = +b.dataset.i;
      paintInfo();
      if (repaintDoor) paintDoor();
    };
  }

  function openModal(i) {
    const door = DOORS[i];
    cfg = { door, size: 1, finish: FINISH_KEYS.indexOf(door.finish), glass: 0 };
    if (cfg.finish < 0) cfg.finish = 0;
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
