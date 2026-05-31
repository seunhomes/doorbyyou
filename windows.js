/* ============================================================
   PANES — Windows catalog logic
   ============================================================ */
(function () {
  const P = window.PANES;
  const { WINDOWS, FINISHES, windowSVG, cart, cartToast } = P;
  const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: n % 1 ? 2 : 0 });

  const grid = document.getElementById('grid');
  const countEl = document.getElementById('count');
  const sortSel = document.getElementById('sort');
  let state = { type: 'all', sort: 'featured' };

  function swatchDots(w) {
    const opts = ['white', 'black', 'iron', w.finish].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
    return opts.map(k => `<span class="sw" title="${FINISHES[k].label}" style="background:${FINISHES[k].swatch}"></span>`).join('');
  }

  function card(w) {
    return `<article class="card" data-name="${w.name}">
      <a class="stage" href="Windows Configurator.html?win=${encodeURIComponent(w.name)}" style="text-decoration:none;">
        <span class="badge">${w.type}</span>
        ${windowSVG(w)}
      </a>
      <div class="info">
        <div class="top"><div class="name">${w.name}</div><div class="price">${fmt(w.price)}</div></div>
        <div class="top"><div class="from">${w.type} window</div><div class="from">Starting from</div></div>
        <div class="desc">${w.desc}</div>
        <div class="swatches">${swatchDots(w)}
          <a class="btn ghost sm" style="margin-left:auto;" href="Windows Configurator.html?win=${encodeURIComponent(w.name)}">Configure</a>
          <button class="btn solid sm add" data-name="${w.name}">Add</button>
        </div>
      </div>
    </article>`;
  }

  function applied() {
    let list = WINDOWS.slice();
    if (state.type !== 'all') list = list.filter(w => w.type === state.type);
    if (state.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (state.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (state.sort === 'az') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }

  function render() {
    const list = applied();
    grid.innerHTML = list.map(card).join('');
    countEl.textContent = list.length + ' style' + (list.length === 1 ? '' : 's');
  }

  grid.addEventListener('click', (e) => {
    const add = e.target.closest('.add'); if (!add) return;
    e.preventDefault();
    const w = WINDOWS.find(x => x.name === add.dataset.name);
    cart.add({ key: 'win-' + w.name, title: w.name + ' Window', sub: w.type + ' · custom size', price: w.price });
    cartToast(w.name + ' Window');
  });

  document.getElementById('typeChips').addEventListener('click', (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    document.querySelectorAll('#typeChips .chip').forEach(x => x.classList.remove('on'));
    b.classList.add('on'); state.type = b.dataset.type; render();
  });
  sortSel.addEventListener('change', () => { state.sort = sortSel.value; render(); });

  const heroMini = document.getElementById('hero-mini');
  if (heroMini) heroMini.innerHTML = windowSVG(WINDOWS.find(w => w.name === 'Casement') || WINDOWS[0]);

  render();
})();
