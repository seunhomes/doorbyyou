/* ============================================================
   PANES — Patio Doors catalog logic
   ============================================================ */
(function () {
  const P = window.PANES;
  const { PATIO, FINISHES, patioSVG } = P;
  const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: n % 1 ? 2 : 0 });

  const grid = document.getElementById('grid');
  const countEl = document.getElementById('count');
  const sortSel = document.getElementById('sort');
  let state = { type: 'all', sort: 'featured' };

  function swatchDots(p) {
    const opts = ['black', 'white', 'iron', p.finish].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
    return opts.map(k => `<span class="sw" title="${FINISHES[k].label}" style="background:${FINISHES[k].swatch}"></span>`).join('');
  }

  function card(p) {
    return `<a class="card" href="Configurator.html">
      <div class="stage">
        <span class="badge">${p.type} · ${p.op}</span>
        ${patioSVG(p)}
      </div>
      <div class="info">
        <div class="top"><div class="name">${p.name}</div><div class="price">${fmt(p.price)}</div></div>
        <div class="top"><div class="from">${p.panels} panel · ${p.type}</div><div class="from">Starting from</div></div>
        <div class="desc">${p.desc}</div>
        <div class="swatches">${swatchDots(p)}<span class="meta">Custom</span></div>
      </div>
    </a>`;
  }

  function applied() {
    let list = PATIO.slice();
    if (state.type !== 'all') list = list.filter(p => p.type === state.type);
    if (state.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (state.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (state.sort === 'az') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }

  function render() {
    const list = applied();
    grid.innerHTML = list.map(card).join('');
    countEl.textContent = list.length + ' system' + (list.length === 1 ? '' : 's');
  }

  document.getElementById('typeChips').addEventListener('click', (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    document.querySelectorAll('#typeChips .chip').forEach(x => x.classList.remove('on'));
    b.classList.add('on'); state.type = b.dataset.type; render();
  });
  sortSel.addEventListener('change', () => { state.sort = sortSel.value; render(); });

  const heroMini = document.getElementById('hero-mini');
  if (heroMini) heroMini.innerHTML = patioSVG(PATIO.find(p => p.name === 'Three Panel Slider') || PATIO[0]);

  render();
})();
